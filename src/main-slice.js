import { createSlice } from '@reduxjs/toolkit';

export const MainSlice = createSlice({
    name: 'main',
    initialState: {
        editMode: true,
        objectModel: [],
        ipAddr: ['localhost', 4444]
    },
    reducers: {
        toggleMode: state => {state.editMode = !state.editMode},
        setAddr: (state, newAddr) => {state.ipAddr[0] = newAddr.payload},
        setPort: (state, newPort) => {state.ipAddr[1] = parseInt(newPort.payload)},
        addObject: (state, newEntry) => {state.objectModel.push(newEntry.payload)},
        updateParams: (state, newData) => {
            const {id, param, value} = newData.payload;
            const index = state.objectModel.findIndex( i => i.id == id);
            state.objectModel[index].params[param] = value;  
        },
        repositionObj: (state, newPos) => {
            const {id,newX,newY} = newPos.payload;
            const index = state.objectModel.findIndex( i => i.id == id);
            state.objectModel[index].x = newX;
            state.objectModel[index].y = newY
        },
        deleteObject: (state, id) => {
            const index = state.objectModel.findIndex( i => i.id == id.payload);
            state.objectModel = state.objectModel.splice(index, 1)
        }
        
    }
})

export const { toggleMode, setAddr, setPort, addObject, updateParams, repositionObj } = MainSlice.actions;

export default MainSlice.reducer;