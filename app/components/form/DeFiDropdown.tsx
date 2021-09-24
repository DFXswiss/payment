import React, { Dispatch, SetStateAction, useState } from "react";
import { StyleSheet, ScrollView, View, StyleProp, ViewStyle } from "react-native";
import { Portal, Dialog, RadioButton, Paragraph, TouchableRipple } from "react-native-paper";
import { DeFiButton } from "../../elements/Buttons";
import AppStyles from "../../styles/AppStyles";

interface Props<T> {
  value?: T;
  setValue: Dispatch<SetStateAction<T | undefined>>;
  items: T[];
  idProp: string;
  labelProp: string;
  title?: string;
  style?: StyleProp<ViewStyle>;
}

const DeFiDropdown = <T extends { [key: string]: any }>({ value, setValue, items, idProp, labelProp, title, style }: Props<T>) => {
  const [visible, setVisible] = useState(false);

  const itemSelected = (item: T) => {
    setValue(item);
    setVisible(false);
  };

  return (
    <>
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={AppStyles.dialog}>
          {title && <Dialog.Title style={{margin: 10}}>{title}</Dialog.Title>}
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView style={styles.scrollView}>
              {items.map((item) => (
                <TouchableRipple key={item[idProp]} onPress={() => itemSelected(item)}>
                  <View style={styles.row}>
                    <Paragraph>{item[labelProp]}</Paragraph>
                    <View pointerEvents="none">
                      <RadioButton
                        value={item[idProp]}
                        status={value && item[idProp] === value[idProp] ? "checked" : "unchecked"}
                      />
                    </View>
                  </View>
                </TouchableRipple>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>

      <DeFiButton
        icon="chevron-down"
        mode="outlined"
        onPress={() => setVisible(true)}
        contentStyle={styles.button}
        style={style}
        compact
      >
        {value && value[labelProp]}
      </DeFiButton>
    </>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    paddingHorizontal: 0,
  },
  scrollView: {
    padding: 10,
  },
  button: {
    flexDirection: "row-reverse",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});

export default DeFiDropdown;
