import React, { useEffect, useRef, useState } from "react";

import { ItemData } from "../types";
import IndexedDbClass from "../indexeddb";  //класс для работы с IndexedDB
import CanvasDraw from "../canvasdraw";     //класс для работы с Canvas

type MqcanvasProps = {
    chartType: string;  //тип графика
    start: number;      //стартовый интервал
    end: number;        //конечный интервал
};

export const Mqcanvas: React.FC<MqcanvasProps> = ({chartType, start, end}) => {
    //ссылка на Canvas
    const chart = useRef<HTMLCanvasElement>(null);
    //состояние лоадера
    const [loader, setLoader] = useState(false);
    
    //рисуем график
    const drawChart = (data:ItemData[]) => {
        if(chart.current){
            let ctx: CanvasRenderingContext2D | null = chart.current.getContext('2d');
            const parent: HTMLElement | null = chart.current.parentNode as HTMLElement;
            chart.current.width = parent.offsetWidth;
            if(ctx){
                let draw = new CanvasDraw(ctx, chart.current.width, data);
                draw.drawChart();    
            }
        }
    }

    //обновляем компонент при изменении интервала или типа графика
    useEffect(() => {
        //работа с IndexedDB
        const db = new IndexedDbClass("MQL");
        db.open(()=>{
            const startYear = start + "-01-01";
            const endYear = end + "-12-31";
            //получаем данные за требуемый интервал
            db.get(chartType,startYear,endYear,data => {
                if(data.length === 0){
                    //если данных нет - грузим их с сервера
                    console.log("getData");
                    setLoader(true);
                    db.getData(chartType, newData => {
                        setLoader(false);
                        drawChart(newData.filter(x => x.t >= startYear &&  x.t <= endYear));
                    });
                } else {
                    //если данные есть - рисуем график по данным из БД
                    console.log("getDB");
                    drawChart(data);
                }
            });
        });
        db.close();
    }, [chartType, start, end]);

    return (
        <div style={{width:"100%", marginLeft :"20px"}}>
            <div>{loader?"идет загрузка...":""}</div>
            <canvas ref={chart} height="600" />
        </div>
    );
};