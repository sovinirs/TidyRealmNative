import { TextProps, ViewProps } from "react-native";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";

export interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
}

export interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
}

export interface IconSymbolProps {
  name: SymbolViewProps["name"];
  size?: number;
  color: string;
  style?: ViewProps["style"];
  weight?: SymbolWeight;
}
