'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@googlemaps/js-api-loader';
import { Trip, Activity } from '@utils/typeDefs';
import { fetchTripDetails } from '@utils/fetchTripDetails';
import { addMarkers } from '@utils/addMarkers';
import { fetchTripActivities } from '@utils/fetchTripActivities';
import { handleCopyToClipboard } from '@utils/handleCopyToClipboard';
import { handleDeleteTrip } from '@utils/deleteTrip';
import formatTimestamp from '@utils/formatTimestamp';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Tooltip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import styles from './tripDetails.module.scss';

const TripDetailsPage = ({ params }: { params: { tripId: string } }) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<
    { marker: google.maps.marker.AdvancedMarkerElement; infoWindow: google.maps.InfoWindow }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const tripId = params.tripId;

  const reloadActivities = async () => {
    const updatedActivities = await fetchTripActivities(tripId);
    setActivities(updatedActivities);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTripDetails(tripId, setTrip, setActivities, setError);
      setLoading(false);
    };

    fetchData();
  }, [tripId]);

  useEffect(() => {
    if (trip) {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API!,
        version: 'weekly',
      });

      loader.load().then(() => {
        const { Map } = google.maps;
        const mapInstance = new Map(
          document.getElementById('map') as HTMLElement,
          {
            center: {
              lat: trip.latitude,
              lng: trip.longitude,
            },
            zoom: 11,
            mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
          }
        );
        setMap(mapInstance);
      });
    }
  }, [trip]);

  useEffect(() => {
    if (map) {
      addMarkers(map, activities, trip?.timezone || '0', reloadActivities).then(
        (createdMarkers) => setMarkers(createdMarkers || [])
      );
    }
  }, [map, activities]);

  const handleActivityClick = (index: number) => {
    if (!map || !markers[index]) {
      console.error('Map or marker not available.');
      return;
    }

    // Close all open info windows
    markers.forEach(({ infoWindow }) => {
      infoWindow.close();
    });

    const { marker, infoWindow } = markers[index];
    const position = marker.position;

    // Pan to the marker and open its info window
    map.panTo(position);
    map.setZoom(14);
    infoWindow.open(map, marker);
  };

  const handleResetView = () => {
    if (map && trip) {
      // Close all open info windows
      markers.forEach(({ infoWindow }) => {
        infoWindow.close();
      });

      // Reset the map view
      map.panTo({ lat: trip.latitude, lng: trip.longitude });
      map.setZoom(11);
    }
  };

  const confirmDeleteTrip = async () => {
    await handleDeleteTrip(tripId, router, setError);
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (!trip) {
    return (
      <Typography className={styles.error}>
        {error || 'Trip details not available.'}
      </Typography>
    );
  }

  return (
    <Box className={styles.pageContainer}>
      <Button
        startIcon={<AiOutlineArrowLeft />}
        onClick={() => router.back()}
        className={styles.backButton}
        variant='outlined'
      >
        Back
      </Button>
      <Typography variant="h4" className={styles.title}>
        Trip Details
      </Typography>
      <Box className={styles.contentContainer}>
        <Card className={styles.tripDetailsCard}>
          <CardContent>
            <Typography>
              <strong>Country:</strong> {trip.country}
            </Typography>
            <Typography>
              <strong>City:</strong> {trip.city || 'N/A'}
            </Typography>
            <Typography>
              <strong>Join Code:</strong>
              <Tooltip title="Click to copy">
                <span
                  onClick={() =>
                    handleCopyToClipboard(trip.joinCode, setCopySuccess)
                  }
                  className={styles.joinCode}
                >
                  {trip.joinCode}
                </span>
              </Tooltip>
              {copySuccess && (
                <span className={styles.copySuccess}>{copySuccess}</span>
              )}
            </Typography>
          </CardContent>
        </Card>

        <Box className={styles.actionsPane}>
          
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => router.push(`/trips/${tripId}/members`)}
          >
            View Members
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => router.push(`/trips/${tripId}/activities`)}
          >
            View All Activities
          </Button>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={() => router.push(`/trips/${tripId}/create-activity`)}
          >
            Create Activity
          </Button>
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Trip
          </Button>
        </Box>
      </Box>

      <Box className={styles.splitContainer}>
        <Box id="map" className={styles.map} />
        <Box className={styles.activityList}>
          <Box className={styles.activityItems}>
            <List>
              {activities.map((activity, index) => (
                <ListItem
                  key={activity.id}
                  className={styles.activityItem}
                  onClick={() => handleActivityClick(index)}
                >
                  <ListItemText
                    primary={activity.activityName}
                    secondary={`Time: ${formatTimestamp(
                      activity.startTime,
                      trip.timezone
                    )} - ${formatTimestamp(activity.endTime, trip.timezone)}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          <Box className={styles.stickyButtons}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleResetView}
              style={{ marginTop: '10px' }}
            >
              Reset View
            </Button>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this trip? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary" autoFocus variant='contained'>
            Cancel
          </Button>
          <Button onClick={confirmDeleteTrip} color="error" variant='outlined'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripDetailsPage;
