'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@googlemaps/js-api-loader';
import { Trip, Activity } from '@utils/typeDefs';
import { fetchTripDetails } from '@utils/fetchTripDetails';
import { addMarkers } from '@utils/addMarkers';
import { fetchTripActivities } from '@utils/fetchTripActivities';
import { handleCopyToClipboard } from '@utils/handleCopyToClipboard';
import { handleDeleteTrip } from '@utils/deleteTrip';
import formatTimestamp from '@utils/formatTimestamp';
import { useDbUser } from '@hooks/useDbUser';
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
import TravelSearchPanel from '@components/TravelSearchPanel/TravelSearchPanel';
import {
  LuGlobe,
  LuMapPin,
  LuKey,
  LuCopy,
  LuUsers,
  LuCalendar,
  LuPlus,
  LuTrash2,
  LuSparkles,
  LuWand2,
  LuMessageCircle,
  LuRotateCcw,
  LuSearch,
} from 'react-icons/lu';

interface OptimizedActivity {
  activityId: string;
  activityName: string;
  suggestedDate: string;
  suggestedTimeSlot: string;
  reasoning: string;
}

const TripDetailsPage = ({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) => {
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [optimization, setOptimization] = useState<{
    optimizedOrder: OptimizedActivity[];
    overallReasoning: string;
  } | null>(null);
  const [optimizationLoading, setOptimizationLoading] = useState(false);

  const router = useRouter();
  const { tripId } = use(params);
  const { dbUser } = useDbUser();

  const reloadActivities = useCallback(async () => {
    const updatedActivities = await fetchTripActivities(tripId);
    setActivities(updatedActivities);
  }, [tripId]);

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

      (async () => {
        const mapsLib = await loader.importLibrary('maps');
        // Preload marker library so addMarkers can use it
        await loader.importLibrary('marker');

        const { Map } = mapsLib as google.maps.MapsLibrary;
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
      })();
    }
  }, [trip]);

  useEffect(() => {
    if (map && trip) {
      addMarkers(
        map,
        activities,
        trip.timezone || '0',
        reloadActivities,
        dbUser?.id
      ).then((createdMarkers) => {
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
      });
    }
  }, [map, activities, trip, reloadActivities, dbUser?.id]);

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
    if (!position) return;

    map.panTo(position as google.maps.LatLngLiteral);
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
      <div className="bg-white rounded-card shadow-card border-l-4 border-l-primary-400 p-4 mb-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2 text-sm text-surface-600">
          <LuGlobe className="w-4 h-4 text-primary-500" />
          <span>{trip.country}</span>
        </div>
        {trip.city && (
          <div className="flex items-center gap-2 text-sm text-surface-600">
            <LuMapPin className="w-4 h-4 text-accent-500" />
            <span>{trip.city}</span>
          </div>
        )}
        <Tooltip title="Click to copy">
          <button
            onClick={() => handleCopyToClipboard(trip.joinCode, setCopySuccess)}
            className="flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 transition-colors duration-200 group"
          >
            <LuKey className="w-4 h-4 text-amber-500" />
            <span className="font-mono text-xs bg-stone-100 px-2 py-1 rounded-btn group-hover:bg-primary-50 transition-colors">
              {trip.joinCode}
            </span>
            <LuCopy className="w-3.5 h-3.5 text-surface-400 group-hover:text-primary-500 transition-colors" />
          </button>
        </Tooltip>
        {copySuccess && (
          <span className="text-xs text-accent-600 font-medium">
            {copySuccess}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        <Button
          variant="outlined"
          size="small"
          startIcon={<LuUsers className="w-4 h-4" />}
          onClick={() => router.push(`/trips/${tripId}/members`)}
        >
          Members
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<LuCalendar className="w-4 h-4" />}
          onClick={() => router.push(`/trips/${tripId}/activities`)}
        >
          All Activities
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<LuPlus className="w-4 h-4" />}
          onClick={() => router.push(`/trips/${tripId}/create-activity`)}
        >
          Activity
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<LuTrash2 className="w-4 h-4" />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete
        </Button>

        <div className="w-px h-6 bg-stone-200 mx-1 hidden sm:block self-center" />

        <Button
          variant="outlined"
          size="small"
          startIcon={<LuSearch className="w-4 h-4" />}
          onClick={() => setSearchOpen(true)}
        >
          Search
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<LuSparkles className="w-4 h-4" />}
          onClick={() => setSuggestionsOpen(true)}
        >
          AI Suggest
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<LuWand2 className="w-4 h-4" />}
          onClick={handleOptimizeItinerary}
          disabled={optimizationLoading || activities.length === 0}
        >
          {optimizationLoading ? 'Optimizing...' : 'Optimize'}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<LuMessageCircle className="w-4 h-4" />}
          onClick={() => setChatOpen(true)}
        >
          Ask AI
        </Button>
      </div>

      {/* Map + Activity sidebar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div
          id="map"
          className="flex-1 h-[500px] rounded-card border border-stone-200 overflow-hidden shadow-card"
        />

        <div className="lg:w-80 w-full bg-white rounded-card shadow-card overflow-hidden flex flex-col max-h-[500px] border border-stone-200/60">
          <div className="p-4 border-b border-stone-200 bg-stone-50">
            <h3 className="font-display font-semibold text-surface-900">
              Activities
            </h3>
            <p className="text-xs text-surface-500 mt-0.5">
              Click to focus on map
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="p-6 text-center text-sm text-surface-500">
                No activities yet
              </div>
            ) : (
              activities.map((activity, index) => (
                <button
                  key={activity.id}
                  onClick={() => handleActivityClick(index)}
                  className="w-full text-left p-4 border-b border-stone-100 last:border-b-0 hover:bg-primary-50/40 transition-colors duration-150 cursor-pointer group"
                >
                  <p className="font-medium text-surface-900 text-sm group-hover:text-primary-700 transition-colors">
                    {activity.activityName}
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    {formatTimestamp(activity.startTime, trip.timezone)} – {formatTimestamp(activity.endTime, trip.timezone)}
                  </p>
                </button>
              ))
            )}
          </div>
          <div className="p-3 border-t border-stone-200 bg-stone-50">
            <button
              onClick={handleResetView}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary-600 bg-white border border-stone-200 hover:border-primary-200 rounded-btn transition-all duration-200"
            >
              <LuRotateCcw className="w-3.5 h-3.5" />
              Reset View
            </button>
          </div>
        </div>
      </div>

      {/* AI Optimization panel */}
      {(optimization || optimizationLoading) && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-surface-900">
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
            <div className="flex items-center gap-3 p-6 bg-white rounded-card shadow-card border border-stone-200/60">
              <CircularProgress size={20} />
              <span className="text-sm text-surface-500">
                Optimizing your itinerary...
              </span>
            </div>
          ) : optimization ? (
            <div className="bg-white rounded-card shadow-card border border-stone-200/60 p-5 space-y-4">
              <p className="text-sm text-surface-600 leading-relaxed">
                {optimization.overallReasoning}
              </p>
              <div className="space-y-2">
                {optimization.optimizedOrder.map((item, i) => (
                  <div
                    key={item.activityId}
                    className="flex items-start gap-3 p-3 rounded-btn bg-stone-50 border border-stone-100"
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

      {/* Travel Search Panel */}
      <TravelSearchPanel
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        trip={trip}
      />

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
