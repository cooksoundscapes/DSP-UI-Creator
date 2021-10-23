import { createSlice } from '@reduxjs/toolkit';

export const MainSlice = createSlice({
    name: 'main',
    initialState: {
        editMode: true,
        objectModel: [],
        lastSave: '{"address":["localhost",4444],"objectModel":[]}',
        ipAddr: ['localhost', 4444],
        projectName: null
    },
    reducers: {
        toggleMode: state => {state.editMode = !state.editMode},
        setAddr: (state, newAddr) => {state.ipAddr[0] = newAddr.payload},
        setPort: (state, newPort) => {state.ipAddr[1] = parseInt(newPort.payload)},
        setProjectName: (state, newName) => {state.projectName = newName.payload},
        setLastSave: (state, lastSave) => {state.lastSave = lastSave.payload},
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
            state.objectModel.splice(index, 1)
        },
        changeOSCPath: (state, newPath) => {
            const {id, path} = newPath.payload;
            const index = state.objectModel.findIndex( i => i.id == id);
            state.objectModel[index].path = path;
        },
        setEntireModel: (state, newModel) => {
            state.objectModel = newModel.payload.objectModel;
            state.ipAddr = newModel.payload.address;
        }
    }
})

export const { toggleMode, setAddr, setPort, setProjectName, setLastSave,
                addObject, updateParams, repositionObj, 
                deleteObject, changeOSCPath, setEntireModel } = MainSlice.actions;

export default MainSlice.reducer;