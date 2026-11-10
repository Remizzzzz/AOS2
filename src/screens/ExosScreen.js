import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { COLORS, COLAB_URL } from '../config';
import { EXERCISES, checkAnswers, fillCode } from '../data/exercises';

const KEY = 'exo-done-v1';

export default function ExosScreen() {
  const [done, setDone] = useState({});
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => v && setDone(JSON.parse(v))).catch(() => {});
  }, []);

  const markDone = useCallback((id) => {
    setDone((d) => {
      const n = { ...d, [id]: true };
      AsyncStorage.setItem(KEY, JSON.stringify(n)).catch(() => {});
      return n;
    });
  }, []);

  if (current) return <Exercise ex={current} onBack={() => setCurrent(null)} onSuccess={() => markDone(current.id)} />;

  const total = EXERCISES.length;
  const count = EXERCISES.filter((e) => done[e.id]).length;
  return (
    <FlatList
      style={{ backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16 }}
      data={EXERCISES}
      keyExtractor={(e) => e.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          <Text style={s.progress}>{count} / {total} réussis</Text>
          <View style={s.bar}><View style={[s.fill, { width: `${(count / total) * 100}%` }]} /></View>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable style={s.row} onPress={() => setCurrent(item)}>
          <Text style={s.check}>{done[item.id] ? '✅' : '⬜'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{item.title}</Text>
            <Text style={s.muted}>{item.concept} · niveau {'★'.repeat(item.level)}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

function Exercise({ ex, onBack, onSuccess }) {
  const [values, setValues] = useState(ex.answers.map(() => ''));
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const verify = () => {
    const r = checkAnswers(ex, values);
    setResult(r);
    if (r.every(Boolean)) onSuccess();
  };
  const reveal = () => setValues(ex.answers.map((a) => a[0]));
  const copy = () => Clipboard.setStringAsync(fillCode(ex, values));
  const colab = async () => {
    await copy();
    WebBrowser.openBrowserAsync(COLAB_URL);
  };

  const ok = result && result.every(Boolean);
  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Pressable onPress={onBack}><Text style={s.back}>‹ Exercices</Text></Pressable>
      <Text style={s.h1}>{ex.title}</Text>
      <Text style={s.statement}>{ex.statement}</Text>

      <View style={s.code}><Text style={s.codeTxt}>{ex.code}</Text></View>

      {ex.answers.map((_, i) => (
        <View key={i} style={s.inputRow}>
          <Text style={s.label}>___ {i + 1} ___</Text>
          <TextInput
            style={[s.input, result && (result[i] ? s.inOk : s.inKo)]}
            value={values[i]}
            onChangeText={(t) => { const v = [...values]; v[i] = t; setValues(v); setResult(null); }}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="réponse"
            placeholderTextColor={COLORS.muted}
          />
        </View>
      ))}

      {result && <Text style={[s.feedback, { color: ok ? COLORS.ok : COLORS.ko }]}>{ok ? 'Bravo, tout est correct !' : 'Certains trous sont incorrects.'}</Text>}
      {showHint && <Text style={s.hint}>💡 {ex.hint}</Text>}

      <Pressable style={s.btn} onPress={verify}><Text style={s.btnTxt}>Vérifier</Text></Pressable>
      <View style={s.rowBtns}>
        <Pressable style={[s.btn, s.alt, { flex: 1 }]} onPress={() => setShowHint(true)}><Text style={s.btnTxt}>Indice</Text></Pressable>
        <Pressable style={[s.btn, s.alt, { flex: 1 }]} onPress={reveal}><Text style={s.btnTxt}>Solution</Text></Pressable>
      </View>

      <Text style={s.sub}>Exécuter avec PyTorch</Text>
      <Text style={s.muted}>Copie le code complété et ouvre Colab (GPU gratuit) : nouveau notebook, coller, exécuter.</Text>
      <View style={s.rowBtns}>
        <Pressable style={[s.btn, s.alt, { flex: 1 }]} onPress={copy}><Text style={s.btnTxt}>Copier le code</Text></Pressable>
        <Pressable style={[s.btn, s.alt, { flex: 1 }]} onPress={colab}><Text style={s.btnTxt}>Copier + Colab</Text></Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  progress: { color: COLORS.text, fontWeight: '700', marginBottom: 6 },
  bar: { height: 6, backgroundColor: COLORS.card, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: COLORS.accent },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 8 },
  check: { fontSize: 20, marginRight: 12 },
  name: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  muted: { color: COLORS.muted, fontSize: 13 },
  back: { color: COLORS.accent, fontSize: 16, marginBottom: 12 },
  h1: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  statement: { color: COLORS.text, fontSize: 15, lineHeight: 22, marginBottom: 12 },
  code: { backgroundColor: '#0b0d11', borderRadius: 10, padding: 12, borderColor: COLORS.border, borderWidth: 1 },
  codeTxt: { color: '#d6deeb', fontFamily: 'monospace', fontSize: 13, lineHeight: 19 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  label: { color: COLORS.muted, fontFamily: 'monospace', width: 80 },
  input: { flex: 1, color: COLORS.text, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, fontFamily: 'monospace' },
  inOk: { borderColor: COLORS.ok },
  inKo: { borderColor: COLORS.ko },
  feedback: { marginTop: 12, fontWeight: '700' },
  hint: { color: COLORS.muted, marginTop: 8 },
  btn: { backgroundColor: COLORS.accent, padding: 13, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  alt: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1 },
  btnTxt: { color: '#fff', fontWeight: '700' },
  rowBtns: { flexDirection: 'row', gap: 10 },
  sub: { color: COLORS.text, fontWeight: '700', fontSize: 16, marginTop: 28, marginBottom: 4 },
});
