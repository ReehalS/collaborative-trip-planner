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
  Button,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import PageHeader from '@components/PageHeader/PageHeader';
import AIChatPanel from '@components/AIChatPanel/AIChatPanel';
import AISuggestionsPanel from '@components/AISuggestionsPanel/AISuggestionsPanel';

interface OptimizedActivity {
  activityId: string;
  activityName: string;
  suggestedDate: string;
  suggestedTimeSlot: string;
  reasoning: string;
}

const TripDetailsPage = ({ params }: { params: { tripId: string } }) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<
    {
      marker: google.maps.marker.AdvancedMarkerElement;
      infoWindow: google.maps.InfoWindow;
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // AI state
  const [chatOpen, setChatOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [optimization, setOptimization] = useState<{
    optimizedOrder: OptimizedActivity[];
    overallReasoning: string;
  } | null>(null);
  const [optimizationLoading, setOptimizationLoading] = useState(false);

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
    if (map && trip) {
      addMarkers(map, activities, trip.timezone || '0', reloadActivities).then(
        (createdMarkers) => {
          setMarkers(createdMarkers || []);

          // Auto-fit bounds to show all markers
          if (createdMarkers && createdMarkers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend({ lat: trip.latitude, lng: trip.longitude });

            createdMarkers.forEach(({ marker }) => {
              if (marker.position) {
                bounds.extend(marker.position as google.maps.LatLngLiteral);
              }
            });

            map.fitBounds(bounds);

            // Cap max zoom for single-marker case
            const listener = google.maps.event.addListener(map, 'idle', () => {
              const currentZoom = map.getZoom();
              if (currentZoom !== undefined && currentZoom > 15) {
                map.setZoom(15);
              }
              google.maps.event.removeListener(listener);
            });
          }
        }
      );
    }
  }, [map, activities]);

  const handleActivityClick = (index: number) => {
    if (!map || !markers[index]) {
      console.error('Map or marker not available.');
      return;
    }

    markers.forEach(({ infoWindow }) => {
      infoWindow.close();
    });

    const { marker, infoWindow } = markers[index];
    const position = marker.position;

    map.panTo(position);
    map.setZoom(14);
    infoWindow.open(map, marker);
  };

  const handleResetView = () => {
    if (map && trip) {
      markers.forEach(({ infoWindow }) => {
        infoWindow.close();
      });

      if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: trip.latitude, lng: trip.longitude });
        markers.forEach(({ marker }) => {
          if (marker.position) {
            bounds.extend(marker.position as google.maps.LatLngLiteral);
          }
        });
        map.fitBounds(bounds);
      } else {
        map.panTo({ lat: trip.latitude, lng: trip.longitude });
        map.setZoom(11);
      }
    }
  };

  const confirmDeleteTrip = async () => {
    await handleDeleteTrip(tripId, router, setError);
    setDeleteDialogOpen(false);
  };

  const handleOptimizeItinerary = async () => {
    if (!trip || activities.length === 0) return;
    setOptimizationLoading(true);
    setOptimization(null);
    try {
      const res = await fetch('/api/ai/optimize-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: trip.city,
          country: trip.country,
          activities: activities.map((a) => ({
            activityId: a.id,
            activityName: a.activityName,
            latitude: a.latitude,
            longitude: a.longitude,
            startTime: a.startTime,
            endTime: a.endTime,
            notes: a.notes,
          })),
        }),
      });
      const data = await res.json();
      setOptimization(data);
    } catch (err) {
      console.error('AI optimize error:', err);
    } finally {
      setOptimizationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <CircularProgress />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <div className="bg-error-light text-error-dark rounded-btn px-4 py-3 text-sm text-center">
          {error || 'Trip details not available.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 animate-fade-in">
      <PageHeader
        title={trip.city ? `${trip.city}, ${trip.country}` : trip.country}
        onBack={() => router.push('/trips')}
      />

      {/* Trip info bar */}
      <div className="bg-white rounded-card shadow-card p-4 mb-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2 text-sm text-surface-600">
          <svg
            className="w-4 h-4 text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{trip.country}</span>
        </div>
        {trip.city && (
          <div className="flex items-center gap-2 text-sm text-surface-600">
            <svg
              className="w-4 h-4 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{trip.city}</span>
          </div>
        )}
        <Tooltip title="Click to copy">
          <button
            onClick={() => handleCopyToClipboard(trip.joinCode, setCopySuccess)}
            className="flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 transition-colors duration-200 group"
          >
            <svg
              className="w-4 h-4 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <span className="font-mono text-xs bg-surface-100 px-2 py-1 rounded group-hover:bg-primary-50 transition-colors">
              {trip.joinCode}
            </span>
            <svg
              className="w-3.5 h-3.5 text-surface-400 group-hover:text-primary-500 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          </button>
        </Tooltip>
        {copySuccess && (
          <span className="text-xs text-success font-medium">
            {copySuccess}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Button
          variant="outlined"
          size="small"
          onClick={() => router.push(`/trips/${tripId}/members`)}
        >
          Members
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => router.push(`/trips/${tripId}/activities`)}
        >
          All Activities
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => router.push(`/trips/${tripId}/create-activity`)}
        >
          + Activity
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Trip
        </Button>

        <div className="w-px h-6 bg-surface-200 mx-1 hidden sm:block" />

        <Button
          variant="outlined"
          size="small"
          onClick={() => setSuggestionsOpen(true)}
        >
          AI Suggest
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleOptimizeItinerary}
          disabled={optimizationLoading || activities.length === 0}
        >
          {optimizationLoading ? 'Optimizing...' : 'Optimize'}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setChatOpen(true)}
        >
          Ask AI
        </Button>
      </div>

      {/* Map + Activity sidebar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div
          id="map"
          className="flex-1 h-[500px] rounded-card border border-surface-200 overflow-hidden"
        />

        <div className="lg:w-80 w-full bg-white rounded-card shadow-card overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-4 border-b border-surface-200">
            <h3 className="font-semibold text-surface-900">Activities</h3>
            <p className="text-xs text-surface-500 mt-0.5">
              Click to focus on map
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="p-4 text-center text-sm text-surface-500">
                No activities yet
              </div>
            ) : (
              activities.map((activity, index) => (
                <button
                  key={activity.id}
                  onClick={() => handleActivityClick(index)}
                  className="w-full text-left p-4 border-b border-surface-100 last:border-b-0 hover:bg-primary-50/50 transition-colors duration-150 cursor-pointer"
                >
                  <p className="font-medium text-surface-900 text-sm">
                    {activity.activityName}
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    {formatTimestamp(activity.startTime, trip.timezone)} &mdash;{' '}
                    {formatTimestamp(activity.endTime, trip.timezone)}
                  </p>
                </button>
              ))
            )}
          </div>
          <div className="p-3 border-t border-surface-200 bg-surface-50">
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={handleResetView}
            >
              Reset View
            </Button>
          </div>
        </div>
      </div>

      {/* AI Optimization panel */}
      {(optimization || optimizationLoading) && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-surface-900">
              Optimized Itinerary
            </h3>
            {optimization && (
              <button
                onClick={() => setOptimization(null)}
                className="text-xs text-surface-400 hover:text-surface-600 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
          {optimizationLoading ? (
            <div className="flex items-center gap-3 p-6 bg-white rounded-card shadow-card">
              <CircularProgress size={20} />
              <span className="text-sm text-surface-500">
                Optimizing your itinerary...
              </span>
            </div>
          ) : optimization ? (
            <div className="bg-white rounded-card shadow-card p-5 space-y-4">
              <p className="text-sm text-surface-600 leading-relaxed">
                {optimization.overallReasoning}
              </p>
              <div className="space-y-2">
                {optimization.optimizedOrder.map((item, i) => (
                  <div
                    key={item.activityId}
                    className="flex items-start gap-3 p-3 rounded-btn bg-surface-50"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 text-sm">
                        {item.activityName}
                      </p>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {item.suggestedDate} &middot; {item.suggestedTimeSlot}
                      </p>
                      <p className="text-xs text-surface-400 mt-1">
                        {item.reasoning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        trip={trip}
        activities={activities}
      />

      {/* AI Suggestions Panel */}
      <AISuggestionsPanel
        isOpen={suggestionsOpen}
        onClose={() => setSuggestionsOpen(false)}
        trip={trip}
        activities={activities}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle className="font-display font-bold">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this trip? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="contained"
            autoFocus
          >
            Cancel
          </Button>
          <Button onClick={confirmDeleteTrip} color="error" variant="outlined">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TripDetailsPage;
