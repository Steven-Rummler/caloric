import { View, Text, Pressable, Alert, Modal, TextInput } from "react-native";
import { Edit, Trash2 } from "react-native-feather";
//import { addEntry, removeEntry } from "../store";
import { useDispatch } from "react-redux";
//import { entryTypeUnit, displayDate } from "../pure/entryTypes";
import { useState } from "react";
import dayjs from "dayjs";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EntryTypePicker(/*props*/) {
    //const { item } = props;
    //const { entryType, label, number, date } = item;
    const dispatch = useDispatch();
    const [editVisible, setEditVisible] = useState(false);
    //const [editLabel, setEditLabel] = useState(label);
    //const [editNumber, setEditNumber] = useState(number);
    //const [editDate, setEditDate] = useState(date);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // const onDateChange = (event, newDate) => {
    //     setShowDatePicker(false);
    //     if (entryType === 'active') setEditDate(dayjs(newDate));
    //     else setShowTimePicker(true);
    // }

    // const onTimeChange = (event, newDate) => {
    //     setShowTimePicker(false);
    //     setEditDate(dayjs(newDate));
    // }

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    // const onDelete = (entry) => {
    //     return Alert.alert(
    //         "Delete Entry?",
    //         "Entry will be gone forever (a long time)",
    //         [
    //             {
    //                 text: "Delete",
    //                 onPress: () => {
    //                     dispatch(removeEntry(entry));
    //                 },
    //             },
    //             {
    //                 text: "Cancel",
    //             },
    //         ]
    //     );
    // };

    return <Text>Entry List Item</Text>
    // <View style={styles.item}>
    //     <View>
    //         <Text>{label && label + ': '}{number} {entryTypeUnit(entryType)}</Text>
    //         <Text>{displayDate(date, entryType)}</Text>
    //     </View>
    //     <View>
    //         <Pressable onPress={e => setEditVisible(true)}><Edit color='black' /></Pressable>
    //         <Pressable onPress={e => onDelete(item)}><Trash2 color='black' /></Pressable>
    //     </View>
    //     <Modal
    //         animationType="slide"
    //         transparent={true}
    //         visible={editVisible}
    //         onRequestClose={() => setEditVisible(!editVisible)}
    //     >
    //         <View style={styles.centeredView}>
    //             <View style={styles.modalView}>
    //                 {entryType === 'food' && <TextInput style={styles.toggleButton} value={editLabel} onChangeText={setEditLabel} />}
    //                 <TextInput autoFocus keyboardType='numeric' value={editNumber} onChangeText={setEditNumber} />
    //                 <Text>{entryTypeUnit(entryType)}</Text>
    //                 <Pressable onPress={showDatepicker}>
    //                     <Text>{displayDate(editDate, entryType)}</Text>
    //                 </Pressable>
    //                 <View style={{ flexDirection: 'row' }}>
    //                     <Pressable
    //                         style={[styles.button, { backgroundColor: 'lightgrey' }]}
    //                         onPress={() => setEditVisible(!editVisible)}
    //                     >
    //                         <Text style={styles.textStyle}>Cancel</Text>
    //                     </Pressable>
    //                     <Pressable
    //                         style={[styles.button, { backgroundColor: 'lightblue' }]}
    //                         onPress={() => {
    //                             dispatch(addEntry({ entryType, date: editDate, number: editNumber, ...(entryType === 'food' && { label: editLabel }) }));
    //                             dispatch(removeEntry(item));
    //                             setEditVisible(!editVisible);
    //                         }}
    //                     >
    //                         <Text style={styles.textStyle}>Save Changes</Text>
    //                     </Pressable>
    //                 </View>
    //             </View>
    //         </View>
    //     </Modal>
    //     {showDatePicker && (
    //         <DateTimePicker
    //             value={editDate.toDate()}
    //             mode='date'
    //             onChange={onDateChange}
    //         />
    //     )}
    //     {showTimePicker && (
    //         <DateTimePicker
    //             value={editDate.toDate()}
    //             mode='time'
    //             onChange={onTimeChange}
    //         />
    //     )}
    // </View>
}

const styles = {
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    // Modal
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
};