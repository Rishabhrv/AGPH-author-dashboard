declare module "@svg-maps/india" {
  interface IndiaLocation {
    id: string;
    name: string;
    path: string;
  }
  interface IndiaMap {
    viewBox: string;
    label: string;
    locations: IndiaLocation[];
  }
  const India: IndiaMap;
  export default India;
}