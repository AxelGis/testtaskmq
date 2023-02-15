import React, { useState } from "react";

//MUI компоненты для разметки и кнопок
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { ChartType } from '../enums';   //типы графиков
import { Mqcanvas } from "./Mqcanvas";  //компонент графика

type MqchartsProps = {
    
};

export const Mqcharts: React.FC<MqchartsProps> = () => {
    //сохраняем состояние для интервала графика и его типа
    const [start, setStart] = useState(1881);
    const [end, setEnd] = useState(2006);
    const [chartType, setChartType] = useState(ChartType.TEMP);

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
                    >
                        Температура
                    </Button>
                    <Button 
                        onClick={()=>{setChartType(ChartType.PREC)}} 
                        fullWidth 
                        variant="contained" 
                        sx={{ mt: 1, mb: 1 }}
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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                                    setStart(+e.target.value<=end?+e.target.value:end);
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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                                    setEnd(+e.target.value>=start?+e.target.value:start);
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