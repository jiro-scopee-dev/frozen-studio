const clamp=v=>Math.max(0,Math.min(1,v));
export const smoother=v=>{const t=clamp(v);return t*t*t*(t*(t*6-15)+10)};
export function glacierTravel(progress){return smoother((progress-.695)/.04)+smoother((progress-.755)/.04)}
