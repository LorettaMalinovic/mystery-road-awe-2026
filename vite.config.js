import { defineConfig } from "vite"; //importiert eine Hilfsfunktion aus Vite - Autovervollständigung/Typprüfung im Editor für die Config-Optionen

export default defineConfig({
  //die Datei exportiert genau ein Ding — die Konfiguration selbst.
  root: ".", //wo der index.html (der Entry-Point) zu finden ist. "." heißt "aktuelles Verzeichnis"
});
