import { useEffect, useState } from "react";

/** JSON-serializable state that survives refreshes on this device/browser. */
export function usePersistentState<T>(key:string,initial:T|(()=>T)){
 const [value,setValue]=useState<T>(()=>{try{const raw=localStorage.getItem("beyond:"+key);if(raw!==null)return JSON.parse(raw) as T;}catch{}return typeof initial==="function"?(initial as ()=>T)():initial;});
 useEffect(()=>{try{localStorage.setItem("beyond:"+key,JSON.stringify(value));}catch{/* Storage may be full or unavailable; the live experience still works. */}},[key,value]);
 return [value,setValue] as const;
}
