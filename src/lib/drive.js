import AsyncStorage from '@react-native-async-storage/async-storage';
import { DRIVE_API_KEY } from '../config';

const CACHE_KEY = 'drive-cache-v1:';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

export const viewUrl = (f) =>
  f.isFolder ? `https://drive.google.com/drive/folders/${f.id}` : `https://drive.google.com/file/d/${f.id}/view`;

// --- Méthode 1 : Drive API v3 (si une clé est fournie) ---
async function listWithApi(folderId) {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,size)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=name&pageSize=200&key=${DRIVE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Drive API ${res.status}`);
  const json = await res.json();
  return json.files.map((f) => ({
    id: f.id,
    name: f.name,
    mime: f.mimeType,
    isFolder: f.mimeType === FOLDER_MIME,
    modified: f.modifiedTime,
  }));
}

// --- Méthode 2 : page publique « embeddedfolderview » (aucune clé nécessaire) ---
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

export function parseEmbeddedFolder(html) {
  const out = [];
  const re = /<div class="flip-entry" id="entry-([\w-]+)"[\s\S]*?<div class="flip-entry-title">([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    const block = m[0];
    const isFolder = /folders\/|drive-folder|\/folder/i.test(block) && !/\/file\/d\//.test(block);
    out.push({ id: m[1], name: decode(m[2].trim()), isFolder, mime: '' });
  }
  return out;
}

async function listWithEmbed(folderId) {
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}#list`);
  if (!res.ok) throw new Error(`Drive ${res.status}`);
  return parseEmbeddedFolder(await res.text());
}

async function listFolder(folderId) {
  if (DRIVE_API_KEY) {
    try {
      return await listWithApi(folderId);
    } catch (e) {
      // repli sur la page publique
    }
  }
  return listWithEmbed(folderId);
}

/** Liste le dossier et un niveau de sous-dossiers. Retourne [{ section, files }]. */
export async function loadCourse(rootId) {
  try {
    const root = await listFolder(rootId);
    const sections = [];
    const rootFiles = root.filter((f) => !f.isFolder);
    if (rootFiles.length) sections.push({ title: 'Cours', data: rootFiles });
    for (const folder of root.filter((f) => f.isFolder)) {
      const files = (await listFolder(folder.id)).filter((f) => !f.isFolder);
      if (files.length) sections.push({ title: folder.name, data: files });
    }
    await AsyncStorage.setItem(CACHE_KEY + rootId, JSON.stringify(sections));
    return { sections, fromCache: false };
  } catch (e) {
    const cached = await AsyncStorage.getItem(CACHE_KEY + rootId);
    if (cached) return { sections: JSON.parse(cached), fromCache: true };
    throw e;
  }
}
