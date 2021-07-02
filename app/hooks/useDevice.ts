import { useWindowDimensions } from "react-native";
import { DeviceClass } from "../utils/Device";

export const useDevice = () => {
  return new DeviceClass(useWindowDimensions());
};
