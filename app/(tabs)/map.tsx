import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import {
  MapPin,
  TriangleAlert as AlertTriangle,
  Coffee,
  Trees,
  Dog,
  Plus,
  X,
} from 'lucide-react-native';
import { WAN_CHAI_MAP, MAP_ASPECT } from '@/lib/mapArt';

type Kind = 'cafe' | 'park' | 'poison' | 'lost';
type Place = {
  id: string;
  kind: Kind;
  name: string;
  detail: string;
  x: number; // % from left
  y: number; // % from top
  mine?: boolean;
};

const KIND_META: Record<Kind, { colour: string; label: string }> = {
  cafe: { colour: '#8D6E63', label: 'Café & treats' },
  park: { colour: '#4C9A5B', label: 'Pet-friendly park' },
  poison: { colour: '#D84339', label: 'Poison hazard' },
  lost: { colour: '#E08A1E', label: 'Lost dog' },
};

// Sample places for the demo. Positions are illustrative, not to scale.
const PLACES: Place[] = [
  { id: 'tamar', kind: 'park', name: 'Tamar Park', detail: 'Harbourfront lawn for leashed walks', x: 17, y: 30 },
  { id: 'barkyard', kind: 'park', name: 'Barkyard @ Hopewell', detail: 'Dog park and café at Hopewell Centre', x: 62, y: 85 },
  { id: 'klf', kind: 'cafe', name: 'KLF Coffee', detail: 'Pet-friendly café', x: 44, y: 58 },
  { id: 'silk', kind: 'cafe', name: 'Silk', detail: 'Café with dog treats', x: 75, y: 63 },
  { id: 'bait', kind: 'poison', name: 'Poison bait alert', detail: 'Suspected poison bait, reported 2 hours ago by a Furlo pawrent', x: 30, y: 71 },
];

type Filter = 'all' | 'cafe' | 'park' | 'alerts';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cafe', label: 'Cafés & treats' },
  { key: 'park', label: 'Parks' },
  { key: 'alerts', label: 'Alerts' },
];

function iconFor(kind: Kind, size = 16) {
  const c = '#fff';
  if (kind === 'cafe') return <Coffee size={size} color={c} />;
  if (kind === 'park') return <Trees size={size} color={c} />;
  if (kind === 'lost') return <Dog size={size} color={c} />;
  return <AlertTriangle size={size} color={c} />;
}

export default function MapScreen() {
  const [places, setPlaces] = useState<Place[]>(PLACES);
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<string | null>('klf');
  const [reportOpen, setReportOpen] = useState(false);
  const [placing, setPlacing] = useState<Kind | null>(null);
  const [mapSize, setMapSize] = useState({ w: 0, h: 0 });
  const mapRef = useRef<View>(null);

  const visible = places.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'alerts') return p.kind === 'poison' || p.kind === 'lost';
    return p.kind === filter;
  });
  const current = places.find((p) => p.id === selected) || null;

  function onMapPress(e: GestureResponderEvent) {
    if (!placing || !mapSize.w) return;
    const ne: any = e.nativeEvent;
    const node: any = mapRef.current;
    let px: number;
    let py: number;
    if (node && typeof node.getBoundingClientRect === 'function' && ne.pageX != null) {
      // Web: measure against the whole map box, not the element under the tap.
      const r = node.getBoundingClientRect();
      px = ((ne.pageX - r.left) / r.width) * 100;
      py = ((ne.pageY - r.top) / r.height) * 100;
    } else {
      px = (ne.locationX / mapSize.w) * 100;
      py = (ne.locationY / mapSize.h) * 100;
    }
    const x = Math.max(4, Math.min(96, px));
    const y = Math.max(6, Math.min(96, py));
    const id = `mine-${Date.now()}`;
    const kind = placing;
    setPlaces((prev) => [
      ...prev,
      {
        id,
        kind,
        name: kind === 'lost' ? 'Lost dog' : 'Poison hazard',
        detail: 'Reported just now by you. Nearby Furlo pawrents get an alert.',
        x,
        y,
        mine: true,
      },
    ]);
    setPlacing(null);
    setSelected(id);
    setFilter('all');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MapPin size={32} color="#ad8b73" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Local Pet Hub</Text>
          <Text style={styles.subtitle}>Pet-friendly spots and alerts in Wan Chai</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View
          ref={mapRef}
          style={[styles.mapBox, { height: mapSize.w ? mapSize.w / MAP_ASPECT : 420 }]}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            setMapSize({ w, h: w / MAP_ASPECT });
          }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onMapPress}>
            <Image source={WAN_CHAI_MAP} style={StyleSheet.absoluteFill} resizeMode="cover" />
          </Pressable>

          {visible.map((p) => {
            const meta = KIND_META[p.kind];
            const active = p.id === selected;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.pinWrap, { left: `${p.x}%`, top: `${p.y}%` }]}
                onPress={() => setSelected(p.id)}
                disabled={!!placing}>
                <View style={[styles.pin, { backgroundColor: meta.colour }, active && styles.pinActive]}>
                  {iconFor(p.kind)}
                </View>
                <View style={[styles.pinLabel, active && { borderColor: meta.colour }]}>
                  <Text style={styles.pinLabelText} numberOfLines={1}>
                    {p.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <Text style={styles.disclaimer}>Illustrative map, not to scale</Text>

          {placing && (
            <View style={styles.placingBanner} pointerEvents="box-none">
              <Text style={styles.placingText}>
                {`Tap the map where the ${placing === 'lost' ? 'dog was last seen' : 'hazard is'}`}
              </Text>
              <TouchableOpacity onPress={() => setPlacing(null)} style={styles.placingCancel}>
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

        </View>

        {!placing && (
          <TouchableOpacity style={styles.reportFab} onPress={() => setReportOpen((v) => !v)}>
            {reportOpen ? <X size={18} color="#fff" /> : <Plus size={18} color="#fff" />}
            <Text style={styles.reportFabText}>{reportOpen ? 'Cancel' : 'Report an alert'}</Text>
          </TouchableOpacity>
        )}

        {reportOpen && !placing && (
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>What do you want to report?</Text>
            <View style={styles.sheetRow}>
              {(['lost', 'poison'] as Kind[]).map((k) => (
                <TouchableOpacity
                  key={k}
                  style={[styles.sheetOption, { borderColor: KIND_META[k].colour }]}
                  onPress={() => {
                    setReportOpen(false);
                    setPlacing(k);
                  }}>
                  <View style={[styles.pin, { backgroundColor: KIND_META[k].colour }]}>{iconFor(k)}</View>
                  <Text style={styles.sheetOptionText}>{KIND_META[k].label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {current && !reportOpen && (
          <View style={styles.card}>
            <View style={[styles.pin, { backgroundColor: KIND_META[current.kind].colour }]}>
              {iconFor(current.kind)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardKind}>{KIND_META[current.kind].label}</Text>
              <Text style={styles.cardName}>{current.name}</Text>
              <Text style={styles.cardDetail}>{current.detail}</Text>
              {!current.mine && <Text style={styles.cardSample}>Sample listing for the demo</Text>}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerText: { marginLeft: 12, flex: 1 },
  title: { fontFamily: 'Poppins-SemiBold', fontSize: 24, color: '#333' },
  subtitle: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#666' },
  filters: { flexGrow: 0 },
  filtersContent: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  filterChipActive: { backgroundColor: '#ad8b73' },
  filterText: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#555' },
  filterTextActive: { color: '#fff' },
  mapBox: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3EDE4',
  },
  pinWrap: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -65 }, { translateY: -16 }],
    width: 130,
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pinActive: { transform: [{ scale: 1.2 }] },
  pinLabel: {
    marginTop: 3,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 5,
    paddingVertical: 1,
    maxWidth: 130,
  },
  pinLabelText: { fontFamily: 'Nunito-Bold', fontSize: 10, color: '#333' },
  disclaimer: {
    position: 'absolute',
    left: 10,
    bottom: 8,
    fontFamily: 'Nunito-Regular',
    fontSize: 10,
    color: '#8A7563',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  reportFab: {
    marginHorizontal: 16,
    marginTop: 12,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D84339',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
  },
  reportFabText: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#fff' },
  placingBanner: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51,51,51,0.85)',
    borderRadius: 12,
    padding: 10,
  },
  placingText: { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 13, color: '#fff' },
  placingCancel: { padding: 4, marginLeft: 8 },
  sheet: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff8f6',
    borderWidth: 1,
    borderColor: '#f3d6d2',
  },
  sheetTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 15, color: '#333', marginBottom: 10 },
  sheetRow: { flexDirection: 'row', gap: 10 },
  sheetOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
  },
  sheetOptionText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#333' },
  card: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#f8f3ef',
  },
  cardKind: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#8A7563', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardName: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#333', marginTop: 2 },
  cardDetail: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#555', marginTop: 2 },
  cardSample: { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#999', marginTop: 6 },
});
