import { configureStore } from "@reduxjs/toolkit";
import MainReducer from './main-slice';

export default configureStore({
    reducer: {
        global: MainReducer
    }
})

