import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  GoogleMap, 
  useJsApiLoader, 
  MarkerF, 
  InfoWindowF 
} from '@react-google-maps/api';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Plus, 
  Accessibility, 
  Baby, 
  Users, 
  Loader2, 
  X,
  Check,
  Map as MapIcon,
  Info,
  LogIn,
  AlertTriangle,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReliefLocation, getReliefLocations, addReliefLocation, calculateDistance } from '../services/relief';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#1e1e24"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#5ce1e6"}]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{"color": "#f3f4f6"}]
    }
  ]
};

// Brutal markers as SVG data URLs helper
const getBrutalMarkerSvg = (color: string, type: string) => {
  const isPublic = type === 'public';
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="20" height="20" transform="rotate(45 16 16)" fill="${color}" stroke="#1e1e24" stroke-width="3"/>
      ${isPublic ? 
        '<circle cx="16" cy="16" r="5" fill="white" stroke="#1e1e24" stroke-width="2"/>' : 
        '<rect x="12" y="12" width="8" height="8" fill="white" stroke="#1e1e24" stroke-width="2"/>'
      }
    </svg>
  `)}`;
};

const getUserMarkerSvg = () => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#3b82f6" fill-opacity="0.2"/>
    <circle cx="12" cy="12" r="6" fill="#2563eb" stroke="white" stroke-width="2"/>
  </svg>
`)}`;

interface ReliefLocatorProps {
  initialCity?: string;
}

export const ReliefLocator: React.FC<ReliefLocatorProps> = ({ initialCity }) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: 48.1351, lng: 11.5820 }); // Munich default
  const [mapZoom, setMapZoom] = useState(13);
  const [locations, setLocations] = useState<ReliefLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ReliefLocation | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newLocationPos, setNewLocationPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [closestToilet, setClosestToilet] = useState<ReliefLocation | null>(null);
  const [authFailure, setAuthFailure] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Catch Google Maps Auth Failures (the "Oops! Something went wrong" error)
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      setAuthFailure(true);
    };
    return () => {
      (window as any).gm_authFailure = null;
    };
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const loadLocations = useCallback(async () => {
    try {
      const data = await getReliefLocations();
      setLocations(data);
    } catch (err) {
      console.error('Error loading locations:', err);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(pos);
          setMapCenter(pos);
        },
        () => console.warn('Geolocation failed')
      );
    }
  }, []);

  // Update closest toilet whenever locations or userLocation changes
  useEffect(() => {
    if (userLocation && locations.length > 0) {
      let minDistance = Infinity;
      let closest = null;

      locations.forEach(loc => {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = loc;
        }
      });

      setClosestToilet(closest);
    }
  }, [userLocation, locations]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (isAdding && e.latLng) {
      setNewLocationPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, [isAdding]);

  const saveNewLocation = async (details: any) => {
    if (!newLocationPos) return;
    try {
      await addReliefLocation({
        ...details,
        lat: newLocationPos.lat,
        lng: newLocationPos.lng
      });
      setIsAdding(false);
      setNewLocationPos(null);
      loadLocations();
    } catch (err) {
      console.error('Error saving location:', err);
    }
  };

  const handleDiscoverNearby = async () => {
    if (!mapRef.current || !isLoaded) return;
    setIsDiscovering(true);
    try {
      const center = mapRef.current.getCenter();
      if (!center) return;
      
      const service = new google.maps.places.PlacesService(mapRef.current);
      
      // Define types to search for
      const types = ['gas_station', 'department_store', 'cafe', 'library', 'restaurant'];
      
      const allResults: any[] = [];
      
      // Perform searches for each type to get a good mix
      const searchPromises = types.map(type => {
        return new Promise<google.maps.places.PlaceResult[]>((resolve) => {
          service.nearbySearch({
            location: center,
            radius: 3000, // 3km radius
            type: type as any
          }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              resolve([]);
            }
          });
        });
      });

      const resultsArray = await Promise.all(searchPromises);
      resultsArray.forEach(results => allResults.push(...results));

      // Map Google Places results to our ReliefLocation format
      const newLocs: ReliefLocation[] = allResults.map((place: google.maps.places.PlaceResult) => {
        // Map Google types to our internal types
        let type: 'public' | 'business' | 'department_store' | 'cafe' | 'library' | 'gas_station' = 'business';
        if (place.types?.includes('gas_station')) type = 'gas_station';
        else if (place.types?.includes('department_store')) type = 'department_store';
        else if (place.types?.includes('cafe')) type = 'cafe';
        else if (place.types?.includes('library')) type = 'library';

        return {
          id: place.place_id || `temp-${Date.now()}-${Math.random()}`,
          name: place.name || 'Unknown Place',
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
          type: type,
          address: place.vicinity || '',
          addedBy: 'system',
          isAccessible: !!(place as any).wheelchair_accessible_entrance,
          hasBabyChanging: false, // Places API doesn't reliably provide this
          isGenderNeutral: false  // Places API doesn't reliably provide this
        };
      });

      // Filter out duplicates and items with invalid coordinates
      setLocations(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const uniqueNew = newLocs.filter(l => l.lat !== 0 && !existingIds.has(l.id));
        
        // Limit to top 30 results to keep map clean
        const combined = [...prev, ...uniqueNew];
        return combined.slice(-50); // Keep last 50 discovered/added locations
      });

    } catch (err) {
      console.error('Discovery failed:', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  const userMarkerIcon = useMemo(() => {
    if (!isLoaded) return null;
    return {
      url: getUserMarkerSvg(),
      scaledSize: new window.google.maps.Size(24, 24),
      anchor: new window.google.maps.Point(12, 12),
    };
  }, [isLoaded]);

  const createBrutalMarker = useCallback((color: string, type: string) => {
    if (!isLoaded) return undefined;
    return {
      url: getBrutalMarkerSvg(color, type),
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16),
    };
  }, [isLoaded]);

  if (!apiKey) {
    return (
      <div className="p-8 sm:p-12 brutal-border bg-[#ffde59] text-[#1e1e24] text-center space-y-6 shadow-[8px_8px_0px_0px_#1e1e24]">
        <div className="w-20 h-20 bg-white brutal-border mx-auto flex items-center justify-center -rotate-3 shadow-[4px_4px_0px_0px_#1e1e24]">
          <MapIcon className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tighter">API Key Required</h3>
          <p className="font-bold text-xs uppercase opacity-80 max-w-md mx-auto">
            To use the Relief Map, you must add your Google Maps API key to the <span className="underline">Secrets</span> panel in AI Studio.
          </p>
        </div>
        <div className="bg-white p-4 brutal-border text-left space-y-3 shadow-[4px_4px_0px_0px_#1e1e24]">
          <p className="text-[10px] font-black uppercase border-b-2 border-[#1e1e24] pb-1">How to fix:</p>
          <ol className="text-[9px] font-bold uppercase space-y-2 list-decimal pl-4">
            <li>Open the <strong>Settings</strong> (gear icon) in AI Studio.</li>
            <li>Go to the <strong>Secrets</strong> tab.</li>
            <li>Add a new secret named: <code className="bg-gray-100 px-1">VITE_GOOGLE_MAPS_API_KEY</code></li>
            <li>Paste your key: <code className="bg-gray-100 px-1">AIzaSyA28...</code></li>
          </ol>
        </div>
      </div>
    );
  }

  if (authFailure || loadError) {
    return (
      <div className="p-8 sm:p-12 brutal-border bg-[#ff5757] text-white text-center space-y-8 shadow-[8px_8px_0px_0px_#1e1e24] animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-white brutal-border mx-auto flex items-center justify-center rotate-6 shadow-[4px_4px_0px_0px_#1e1e24]">
          <AlertTriangle className="w-12 h-12 text-[#ff5757]" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Google Maps Configuration Error</h3>
          <p className="font-bold text-sm max-w-lg mx-auto uppercase opacity-90">
            The API key is valid, but Google is rejecting the request. This usually means a setting is missing in your Cloud Console.
          </p>
        </div>

        <div className="bg-white text-[#1e1e24] p-6 brutal-border text-left space-y-4 shadow-[6px_6px_0px_0px_#1e1e24]">
          <h4 className="font-black uppercase text-sm border-b-4 border-[#1e1e24] pb-2 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" /> Critical Checklist
          </h4>
          <ul className="text-xs font-bold uppercase space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-600 flex-shrink-0 flex items-center justify-center text-[10px]">1</div>
              <div>
                <span className="text-green-700">Maps JavaScript API:</span> You said this is enabled. Great!
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 border-2 border-red-600 flex-shrink-0 flex items-center justify-center text-[10px]">2</div>
              <div>
                <span className="text-red-600 underline">Billing Account:</span> Google Maps <span className="italic">requires</span> a billing account linked to the project (even for the free tier). If billing is not active, the map will fail.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 border-2 border-red-600 flex-shrink-0 flex items-center justify-center text-[10px]">3</div>
              <div>
                <span className="text-red-600 underline">Places API:</span> Ensure the "Places API" is also enabled in the same project.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 border-2 border-red-600 flex-shrink-0 flex items-center justify-center text-[10px]">4</div>
              <div>
                <span className="text-red-600 underline">Referrer Restrictions:</span> In Credentials, set "Application restrictions" to <span className="bg-gray-100 px-1">None</span> temporarily to see if it fixes the issue.
              </div>
            </li>
          </ul>
          <div className="pt-4 border-t-2 border-gray-100 flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="brutal-btn bg-[#5ce1e6] px-4 py-2 text-[10px] font-black uppercase flex items-center justify-center gap-2"
            >
              <Loader2 className="w-3 h-3" /> Refresh Page
            </button>
            <a 
              href="https://console.cloud.google.com/google/maps-apis/overview" 
              target="_blank" 
              className="brutal-btn bg-[#ffde59] px-4 py-2 text-[10px] font-black uppercase inline-block text-center"
            >
              Open Google Cloud Console
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white brutal-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#1e1e24]">
        <div className="flex items-center gap-3">
          <div className="bg-[#ff5757] p-2 brutal-border">
            <MapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-black uppercase text-xl leading-none">Relief Map</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Public Toilet Locator & Community Map</p>
          </div>
        </div>
        
        {closestToilet && userLocation && (
          <div className="bg-green-50 brutal-border px-4 py-2 flex items-center gap-3">
            <div className="bg-green-500 p-1.5 rounded-full">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-green-600">Closest Relief Found</p>
              <p className="text-xs font-black uppercase">{closestToilet.name} ({calculateDistance(userLocation.lat, userLocation.lng, closestToilet.lat, closestToilet.lng).toFixed(1)}km)</p>
            </div>
            <button 
              onClick={() => {
                setMapCenter({ lat: closestToilet.lat, lng: closestToilet.lng });
                setMapZoom(18);
                setSelectedLocation(closestToilet);
              }}
              className="text-[10px] font-black uppercase underline hover:text-green-700"
            >
              View
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[600px] brutal-border relative overflow-hidden bg-gray-100 shadow-[8px_8px_0px_0px_#1e1e24]">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={mapZoom}
              options={mapOptions}
              onLoad={map => mapRef.current = map}
              onClick={onMapClick}
            >
              {userLocation && <MarkerF position={userLocation} icon={userMarkerIcon!} zIndex={1000} />}
              
              {locations.map(loc => (
                <MarkerF 
                  key={loc.id}
                  position={{ lat: loc.lat, lng: loc.lng }}
                  icon={createBrutalMarker(
                    loc.type === 'public' ? '#5ce1e6' : '#ffde59',
                    loc.type
                  )}
                  onClick={() => setSelectedLocation(loc)}
                />
              ))}

              {newLocationPos && (
                <MarkerF 
                  position={newLocationPos}
                  icon={createBrutalMarker('#ff5757', 'public')}
                  animation={window.google.maps.Animation.BOUNCE}
                />
              )}

              {selectedLocation && (
                <InfoWindowF
                  position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  onCloseClick={() => setSelectedLocation(null)}
                >
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${selectedLocation.addedBy === 'system' ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                        {selectedLocation.addedBy === 'system' ? 'Verified' : 'Community'}
                      </span>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border bg-gray-50 border-gray-200">
                        {selectedLocation.type}
                      </span>
                    </div>
                    <h4 className="font-black uppercase text-sm mb-2">{selectedLocation.name}</h4>
                    <div className="flex gap-2 mb-3">
                      {selectedLocation.isAccessible && <Accessibility className="w-4 h-4 text-blue-600" title="ADA Accessible" />}
                      {selectedLocation.hasBabyChanging && <Baby className="w-4 h-4 text-pink-600" title="Baby Changing" />}
                      {selectedLocation.isGenderNeutral && <Users className="w-4 h-4 text-purple-600" title="Gender Neutral" />}
                    </div>
                    <button 
                      className="w-full bg-[#1e1e24] text-white py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`)}
                    >
                      Get Directions
                    </button>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}

          {/* Map Overlays */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2">
            <button 
              onClick={handleDiscoverNearby}
              disabled={isDiscovering}
              className="brutal-btn bg-[#ffde59] px-6 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl"
            >
              {isDiscovering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Scan for Toilets
                </>
              )}
            </button>
            <div className="bg-white/90 backdrop-blur px-3 py-1 brutal-border text-[8px] font-black uppercase tracking-tighter">
              Searching: Gas Stations, Cafes, Libraries, Stores
            </div>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            <button 
              onClick={() => userLocation && setMapCenter(userLocation)}
              className="bg-white p-3 brutal-border hover:bg-gray-50 shadow-lg"
              title="Find my location"
            >
              <Navigation className="w-5 h-5" />
            </button>
            {closestToilet && (
              <button 
                onClick={() => {
                  setMapCenter({ lat: closestToilet.lat, lng: closestToilet.lng });
                  setMapZoom(18);
                  setSelectedLocation(closestToilet);
                }}
                className="bg-[#7ed957] p-3 brutal-border hover:bg-green-400 shadow-lg"
                title="Go to closest toilet"
              >
                <MapPin className="w-5 h-5 text-white" />
              </button>
            )}
            <button 
              onClick={() => {
                setIsAdding(!isAdding);
                setNewLocationPos(null);
              }}
              className={`p-3 brutal-border shadow-lg ${isAdding ? 'bg-[#ff5757] text-white' : 'bg-white text-[#1e1e24] hover:bg-gray-50'}`}
              title="Add a location"
            >
              {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
            <div className="flex flex-col brutal-border bg-white shadow-lg overflow-hidden">
              <button 
                onClick={() => setMapZoom(prev => Math.min(prev + 1, 20))}
                className="p-3 hover:bg-gray-50 border-b brutal-border-b transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}
                className="p-3 hover:bg-gray-50 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 md:left-auto md:w-80 bg-white brutal-border p-4 shadow-2xl z-[1001]"
              >
                <h3 className="font-black uppercase text-sm mb-2">Add New Relief Point</h3>
                {!newLocationPos ? (
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Click anywhere on the map to drop a pin.</p>
                ) : !user ? (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-red-500 uppercase">Sign in to contribute to the map.</p>
                    <button onClick={handleLogin} className="w-full brutal-btn bg-[#ffde59] py-2 text-[10px] font-black uppercase flex items-center justify-center gap-2">
                      <LogIn className="w-3 h-3" /> Login with Google
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    saveNewLocation({
                      name: formData.get('name'),
                      type: formData.get('type'),
                      isAccessible: formData.get('isAccessible') === 'on',
                      hasBabyChanging: formData.get('hasBabyChanging') === 'on',
                      isGenderNeutral: formData.get('isGenderNeutral') === 'on'
                    });
                  }} className="space-y-3">
                    <input name="name" required placeholder="Name of place" className="w-full p-2 brutal-border text-xs font-bold" />
                    <select name="type" className="w-full p-2 brutal-border text-xs font-bold">
                      <option value="public">Public Toilet</option>
                      <option value="gas_station">Gas Station</option>
                      <option value="cafe">Cafe / Restaurant</option>
                      <option value="library">Library</option>
                      <option value="department_store">Department Store</option>
                    </select>
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-1 text-[8px] font-black uppercase cursor-pointer">
                        <input type="checkbox" name="isAccessible" className="w-3 h-3 brutal-border" /> Wheelchair Friendly
                      </label>
                      <label className="flex items-center gap-1 text-[8px] font-black uppercase cursor-pointer">
                        <input type="checkbox" name="hasBabyChanging" className="w-3 h-3 brutal-border" /> Family Friendly
                      </label>
                      <label className="flex items-center gap-1 text-[8px] font-black uppercase cursor-pointer">
                        <input type="checkbox" name="isGenderNeutral" className="w-3 h-3 brutal-border" /> Gender Neutral
                      </label>
                    </div>
                    <button type="submit" className="w-full brutal-btn bg-[#ffde59] py-2 text-xs font-black uppercase">Save Pin</button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-white brutal-border p-4 shadow-[4px_4px_0px_0px_#1e1e24]">
            <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" /> Map Legend
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#5ce1e6] brutal-border rotate-45"></div>
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full border border-black"></div>
                </div>
                <span className="text-[10px] font-black uppercase">Public Restroom</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#ffde59] brutal-border rotate-45"></div>
                  <div className="absolute w-1.5 h-1.5 bg-white border border-black"></div>
                </div>
                <span className="text-[10px] font-black uppercase">Business / Cafe</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[#ff5757] brutal-border rotate-45"></div>
                <span className="text-[10px] font-black uppercase">New Pin Dropped</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e24] text-white p-4 brutal-border shadow-[4px_4px_0px_0px_#ff5757]">
            <h3 className="font-black uppercase text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ff5757]" /> Pro Tip
            </h3>
            <p className="text-[10px] font-bold uppercase leading-relaxed opacity-80">
              Gas stations, libraries, and department stores are your best bet for clean, accessible restrooms in most cities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
