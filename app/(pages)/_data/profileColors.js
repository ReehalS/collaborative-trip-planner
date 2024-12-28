import {
  LuCar,
  LuTruck,
  LuSailboat,
  LuShip,
  LuPlane,
  LuBike,
} from 'react-icons/lu';
import { PiBus, PiTrain } from "react-icons/pi";

const profileColors = [
  { background: '#FF5733', icon: LuCar }, // Red - Car
  { background: '#33FF57', icon: LuTruck }, // Green - Truck
  { background: '#3357FF', icon: LuSailboat }, // Blue - Sailboat
  { background: '#F3FF33', icon: LuShip }, // Yellow - Ship
  { background: '#FF33A8', icon: PiTrain }, // Pink - Plane
  { background: '#33FFF3', icon: LuPlane }, // Cyan - Train
  { background: '#A833FF', icon: PiBus }, // Purple - Bus
  { background: '#FFC133', icon: LuBike }, // Orange - Bike
];

export default profileColors;

