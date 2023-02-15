import { ItemData } from "./types";

export default class CanvasDraw {
    width: number;          //ширина Canvas
    innerWidth: number;     //внутренняя ширина зоны отрисовки данных
    height: number;         //высота Canvas
    innerHeight: number;    //внутренняя высота зоны отрисовки данных
    min: number;            //минимальное значение шкалы y
    max: number;            //максимальное значение шкалы y
    dx: number;             //расстояние между точками x
    dy: number;             //шаг шкалы y
    py: number;             //расстояние шага шкалы y
    zeropoint: number;      //координата 0 на графике по y
    ctx: CanvasRenderingContext2D;      //контекст Canvas
    data: ItemData[];                   //данные для графика

    constructor(ctx: CanvasRenderingContext2D, width: number, data: ItemData[]) {
        this.width = width;
        this.innerWidth = this.width - 40;
        this.height = 600;
        this.innerHeight = this.height - 20;
        this.ctx = ctx;
        this.data = data;
        //вычисляем максимум по y
        this.max = data.reduce((prev, curr) => {
            return Math.max(prev,curr.v);
        },0);
        //вычисляем минимум по y
        this.min = data.reduce((prev, curr) => {
            return Math.min(prev,curr.v);
        },0);
        //вычисляем шаги для точек, т.к. график автомасштабируется по ширине
        this.dx = this.innerWidth/data.length;
        this.dy = Math.ceil((this.max - this.min)/10);
        this.py = this.innerHeight/10;
        this.zeropoint = this.max*this.py/this.dy + this.py/2 - 10;
    }

    //рисуем график
    drawChart(){
        this.clear();       //очищаем график
        this.drawData();    //рисуем данные
        this.drawAxis();    //рисуем оси
        this.drawLabels();  //наносим подписи шкалы
    }

    //очищаем график
    clear(){
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    //рисуем оси
    drawAxis() {
        //y
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1.0;
        this.ctx.beginPath();
        this.ctx.moveTo(30, 10);
        this.ctx.lineTo(30, this.height - 20);
        this.ctx.stroke();

        //x
        this.ctx.beginPath();
        this.ctx.moveTo(30, this.zeropoint);
        this.ctx.lineTo(this.width, this.zeropoint);
        this.ctx.stroke();
        this.ctx.fillText(0+"", 4, this.zeropoint); 
    }
    
    //наносим подписи шкалы
    drawLabels() {
        this.ctx.strokeStyle = "black";
        //подписи по y
        for(let i = 0; i < 10; i++) {
            let val:number = this.max - i*this.dy;
            this.ctx.fillText(val.toFixed(1), 4, i * this.py + this.py/2); 
        }
    
        //подписи по x
        const di: number = Math.ceil(this.data.length/10);
        for(let i = 0; i < this.data.length; i+=di) { 
            this.ctx.fillText(this.data[i].t, i*this.dx + 30, this.zeropoint + 10);
        }
    }
    
    //рисуем данные
    drawData() {
        this.ctx.strokeStyle = "lime"; 
        
        this.ctx.beginPath(); 
        this.ctx.moveTo(30, this.zeropoint);        //начинаем с (0,0)
        for(let i = 0; i < this.data.length; i++) {
            let y:number = (this.max-this.data[i].v)*this.py/this.dy;
            this.ctx.lineTo((i+1)*this.dx + 30, y + this.py/2 - 10);
        }
        this.ctx.stroke();
    }
}

