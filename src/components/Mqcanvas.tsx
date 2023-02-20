import React, { useContext, useEffect, useRef, useState } from "react";

import { ItemData } from "../types";
import CanvasDraw from "../canvasdraw";     //класс для работы с Canvas
import {DataContext} from "./Mqcharts";     //класс для работы с Canvas

type MqcanvasProps = {
    chartType: string;  //тип графика
    start: number;      //стартовый интервал
    end: number;        //конечный интервал
};

export const Mqcanvas: React.FC<MqcanvasProps> = ({start, end}) => {
    //ссылка на Canvas
    const chart = useRef<HTMLCanvasElement>(null);
    const data = useContext(DataContext);

    //берем данные из кэша и фильтруем под интервал
    const calcData = ():ItemData[] => {
        const startYear = start + "-01-01";
        const endYear = end + "-12-31";
        //отфильтрованные данные
        const filteredData:ItemData[] = data ? data.filter(x=>x.t >= startYear && x.t <= endYear) : [];
        //считаем среднесуточное значение для каждого года
        const result:ItemData[] = filteredData.reduce((curr:ItemData[],item)=>{
            const year:string = (new Date(item.t)).getFullYear().toString();
            const yearVal = curr.find(x => x.t === year);
            if(yearVal){
                yearVal.v += item.v;
            } else {
                curr.push({t: year, v: item.v});
            }
            return curr;
        },[]).map(el => {
            return {...el, v: el.v/365};
        });
        return result;
    }

    //обновляем компонент при изменении интервала или данных
    useEffect(() => {
        if(chart.current){
            let ctx: CanvasRenderingContext2D | null = chart.current.getContext('2d');
            const parent: HTMLElement | null = chart.current.parentNode as HTMLElement;
            chart.current.width = parent.offsetWidth;
            if(ctx && data){
                let draw = new CanvasDraw(ctx, chart.current.width, calcData());
                draw.drawChart();    
            }
        }
    }, [start, end, data]);

    return (
        <div style={{width:"100%", marginLeft :"20px"}}>
            <canvas ref={chart} height="600" />
        </div>
    );
};