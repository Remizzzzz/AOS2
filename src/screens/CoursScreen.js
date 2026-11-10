import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { COLORS, DRIVE_FOLDER_ID } from '../config';
import { loadCourse, viewUrl } from '../lib/drive';

const icon = (name) => (/\.pdf$/i.test(name) ? '📕' : /\.(pptx?|key)$/i.test(name) ? '📊' : /\.ipynb$/i.test(name) ? '📓' : '📄');

export default function CoursScreen() {
  const [state, setState] = useState({ loading: true, sections: [], error: null, fromCache: false });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { sections, fromCache } = await loadCourse(DRIVE_FOLDER_ID);
      setState({ loading: false, sections, error: null, fromCache });
    } catch (e) {
      setState({ loading: false, sections: [], error: String(e.message || e), fromCache: false });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const open = (f) => WebBrowser.openBrowserAsync(viewUrl(f));
  const openFolder = () => WebBrowser.openBrowserAsync(viewUrl({ id: DRIVE_FOLDER_ID, isFolder: true }));

  if (state.error && !state.sections.length) {
    return (
      <View style={s.center}>
        <Text style={s.title}>Impossible de lire le Drive</Text>
        <Text style={s.muted}>{state.error}</Text>
        <Text style={[s.muted, { marginTop: 8 }]}>
          Vérifie que le dossier est partagé en « Tous les utilisateurs disposant du lien ».
        </Text>
        <Pressable style={s.btn} onPress={load}><Text style={s.btnTxt}>Réessayer</Text></Pressable>
        <Pressable style={[s.btn, s.btnAlt]} onPress={openFolder}><Text style={s.btnTxt}>Ouvrir le dossier Drive</Text></Pressable>
      </View>
    );
  }

  return (
    <SectionList
      style={{ backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16 }}
      sections={state.sections}
      keyExtractor={(f) => f.id}
      refreshControl={<RefreshControl refreshing={state.loading} onRefresh={load} tintColor={COLORS.accent} />}
      ListHeaderComponent={
        state.fromCache ? <Text style={s.banner}>Hors-ligne : liste enregistrée lors de la dernière synchronisation</Text> : null
      }
      ListEmptyComponent={state.loading ? <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} /> : <Text style={s.muted}>Aucun fichier trouvé.</Text>}
      renderSectionHeader={({ section }) => <Text style={s.section}>{section.title}</Text>}
      renderItem={({ item }) => (
        <Pressable style={s.row} onPress={() => open(item)}>
          <Text style={s.icon}>{icon(item.name)}</Text>
          <Text style={s.name} numberOfLines={2}>{item.name}</Text>
        </Pressable>
      )}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: COLORS.bg, padding: 24, justifyContent: 'center' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  muted: { color: COLORS.muted },
  banner: { color: COLORS.muted, backgroundColor: COLORS.card, padding: 10, borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
  section: { color: COLORS.accent, fontWeight: '700', fontSize: 13, textTransform: 'uppercase', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 8 },
  icon: { fontSize: 22, marginRight: 12 },
  name: { color: COLORS.text, flex: 1, fontSize: 15 },
  btn: { backgroundColor: COLORS.accent, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  btnAlt: { backgroundColor: COLORS.card, marginTop: 8 },
  btnTxt: { color: '#fff', fontWeight: '700' },
});
