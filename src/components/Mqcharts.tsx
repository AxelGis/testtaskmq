import React, { useState, useEffect, createContext } from "react";

//MUI компоненты для разметки и кнопок
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { SelectChangeEvent } from "@mui/material";

import IndexedDbClass from "../indexeddb";  //класс для работы с IndexedDB
import { ChartType } from '../enums';       //типы графиков
import { ItemData } from "../types";
import { Mqcanvas } from "./Mqcanvas";      //компонент графика

type MqchartsProps = {
    
};

type DataContextType = {
    name:string,  
    data:ItemData[],  
}

//контекст для сохранения данных из БД
export const DataContext = createContext<ItemData[] | undefined>([]);

export const Mqcharts: React.FC<MqchartsProps> = () => {
    //сохраняем состояние для интервала графика и его типа
    const [start, setStart] = useState(1881);
    const [end, setEnd] = useState(2006);
    const [chartType, setChartType] = useState(ChartType.TEMP);
    //состояние лоадера
    const [loader, setLoader] = useState(false);
    //данные из БД
    const [dbData, setDBData] = useState<DataContextType[]>([
        {   
            name: ChartType.TEMP,
            data: [],
        },
        {   
            name: ChartType.PREC,
            data: [],
        }
    ]);

    //генерируем список интервалов
    const years = [];
    for(let i=1881;i<2007;i++){
        years.push(<MenuItem key={i} value={i}>{i}</MenuItem>);
    }

    return (
        <Container component="main" maxWidth="lg">
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <Button 
                        onClick={()=>{setChartType(ChartType.TEMP)}} 
                        fullWidth 
                        variant="contained" 
                        sx={{ mt: 1, mb: 1 }}
                        color={chartType === ChartType.TEMP ? "success" : "primary"}
                    >
                        Температура
                    </Button>
                    <Button 
                        onClick={()=>{setChartType(ChartType.PREC)}} 
                        fullWidth 
                        variant="contained" 
                        sx={{ mt: 1, mb: 1 }}
                        color={chartType === ChartType.PREC ? "success" : "primary"}
                    >
                        Осадки
                    </Button>
                </Grid>
                <Grid item xs={9}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Select 
                                id="startYear" 
                                fullWidth 
                                value={start} 
                                label="Начало" 
                                sx={{ mt: 1, mb: 1 }} 
                                onChange={(e: SelectChangeEvent<number>)=>{
                                    const val:number = e.target.value as number;
                                    setStart(val <= end ? val : end);
                                }} 
                            >
                                {years}
                            </Select>
                        </Grid>
                        <Grid item xs={6}>
                            <Select 
                                id="endYear" 
                                fullWidth 
                                value={end} 
                                label="Конец" 
                                sx={{ mt: 1, mb: 1 }} 
                                onChange={(e: SelectChangeEvent<number>)=>{
                                    const val:number = e.target.value as number;
                                    setEnd(val >= start ? val : start);
                                }} 
                            >
                                {years}
                            </Select>
                        </Grid>
                        <Mqcanvas chartType={chartType} start={start} end={end} />
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};