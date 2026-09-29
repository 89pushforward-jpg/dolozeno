const shapes={
 ufo:'<path d="M8 12a4 4 0 0 1 8 0"/><ellipse cx="12" cy="13" rx="9" ry="3"/><path d="m6 19-1 2m7-2v3m6-3 1 2M7 6l1-2m10 2 1-2"/>',
 civilizace:'<path d="m2 20 9-16 11 16H2Z"/><path d="m11 4 3 16m0-7 8 7M7 12h4M5 16h7"/>',
 vesmir:'<circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="12" ry="3.5" transform="rotate(-30 12 12)"/><path d="M20 2v4m-2-2h4"/>',
 zivot:'<path d="M12 3C5 3 3 8 5 13c1 3 5 8 7 8s6-5 7-8c2-5 0-10-7-10Z"/><path d="M7 10c3 0 4 2 4 4-3 0-4-2-4-4Zm10 0c-3 0-4 2-4 4 3 0 4-2 4-4ZM10 18h4"/>',
 technologie:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
 konspirace:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M3 3l2 2m14 14 2 2M21 3l-2 2M5 19l-2 2"/>'
};
module.exports=key=>`<svg class="topic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[key]||''}</svg>`;
