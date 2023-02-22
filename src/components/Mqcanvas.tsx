import React, { useContext, useEffect, useRef, useState } from "react";

import { ItemData } from "../types";
import CanvasDraw from "../canvasdraw";     //класс для работы с Canvas
import {DataContext} from "./Mqcharts";     //класс для работы с Canvas
import IndexedDbClass from "../indexeddb";  //класс для работы с IndexedDB
import { ChartType } from '../enums';       //типы графиков

type MqcanvasProps = {
    chartType: string;  //тип графика
    start: number;      //стартовый интервал
    end: number;        //конечный интервал
};

type DataContextType = {
    name:string,  
    data:ItemData[],  
}

export const Mqcanvas: React.FC<MqcanvasProps> = ({start, end, chartType}) => {
    //ссылка на Canvas
    const chart = useRef<HTMLCanvasElement>(null);
    const allStart = "1881-01-01";
    const allEnd = "2006-12-31";

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

    //берем данные из кэша и фильтруем под интервал
    const calcData = (data:ItemData[]):ItemData[] => {
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
        if(dbData.find(x=>x.name === chartType)?.data.length === 0){
            //работа с IndexedDB
            const db = new IndexedDbClass("MQL");
            db.open(()=>{
                //получаем данные за требуемый интервал
                db.get(chartType,allStart,allEnd,data => {
                    if(data.length === 0){
                        //если данных нет - грузим их с сервера
                        console.log("getData");
                        db.getData(chartType, newData => {
                            //сохраняем в кэш
                            setDBData(dbData.map((dt:DataContextType)=>
                                dt.name === chartType
                                ? {name: chartType, data: newData}
                                : dt
                            ));
                        });
                    } else {
                        //если данные есть сохраняем в кэш
                        console.log("getDB");
                        setDBData(dbData.map((dt:DataContextType)=>
                            dt.name === chartType
                            ? {name: chartType, data: data}
                            : dt
                        ));
                    }
                });
            });
            db.close();
        }

        if(chart.current){
            let ctx: CanvasRenderingContext2D | null = chart.current.getContext('2d');
            const parent: HTMLElement | null = chart.current.parentNode as HTMLElement;
            chart.current.width = parent.offsetWidth;
            const data = dbData.find(x=>x.name === chartType);
            if(ctx && data){
                let draw = new CanvasDraw(ctx, chart.current.width, calcData(data.data));
                draw.drawChart();    
            }
        }
    }, [start, end, chartType, dbData]);

    return (
        <div style={{width:"100%", marginLeft :"20px"}}>
            <canvas ref={chart} height="600" />
        </div>
    );
};