import { Platform, StyleSheet, TextStyle } from "react-native";
import Colors from "../config/Colors";

export const DefaultCursor = (Platform.OS === "web" ? { cursor: "default" } : {}) as TextStyle;

export default StyleSheet.create({
  // layout
  container: {
    flex: 1,
    backgroundColor: Colors.Blue,
  },
  containerHorizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
  containerHorizontalWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  dialog: {
    maxWidth: 300,
    marginHorizontal: "auto",
    backgroundColor: Colors.Blue,
    maxHeight: "90vh",
  },
  cell: {
    flex: 1,
    alignSelf: "stretch",
  },
  alignCenter: {
    alignItems: "center",
  },
  // elements
  link: {
    color: Colors.Primary,
  },
  buttonLink: {
    marginHorizontal: 0,
  },
  h1: {
    fontSize: 30,
    fontWeight: "bold",
  },
  h2: {
    fontSize: 25,
    fontWeight: "bold",
  },
  h3: {
    fontSize: 20,
  },
  h4: {
    fontSize: 16,
  },
  error: {
    backgroundColor: Colors.Error,
    padding: 10,
    borderRadius: 5,
  },
  // style
  i: {
    fontStyle: "italic",
  },
  b: {
    fontWeight: "bold",
  },
  hidden: {
    opacity: 0,
  },
  noDisplay: {
    display: "none",
  },
  transparent: {
    opacity: 0.3,
  },
  halfWidth: {
    flex: 1,
    width: "50%",
    margin: "auto"
  },
  center: {
    textAlign: "center",
  },
  right: {
    textAlign: "right",
  },
  // spaces
  mra: {
    marginRight: "auto",
  },
  mr10: {
    marginRight: 10,
  },
  mr20: {
    marginRight: 20,
  },
  mla: {
    marginLeft: "auto",
  },
  ml10: {
    marginLeft: 10,
  },
  ml20: {
    marginLeft: 20,
  },
  mt10: {
    marginTop: 10,
  },
  mt20: {
    marginTop: 20,
  },
  singleColFormContainer: {
    width: "100%",
    maxWidth: 400,
  },
});
