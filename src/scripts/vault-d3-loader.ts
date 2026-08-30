/**
 * Vault d3.js loader — bundled by Astro from node_modules.
 *
 * d3-force is a ~14KB dependency already installed in node_modules.
 * This script makes it available to the vault page's inline graph code
 * via window.__d3GraphApi, avoiding a CDN dynamic import.
 */

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force";

(window as any).__d3GraphApi = {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  loaded: true,
};