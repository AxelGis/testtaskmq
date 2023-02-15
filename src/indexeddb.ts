import { ChartType } from './enums';
import type { ItemData } from './types';
import { getData } from './utils';

export default class IndexedDbClass {
    db:IDBDatabase | null;      //БД
    dbName:string;              //название БД
    dbVersion:number;           //версия БД

    constructor(dbName: string) {
        this.db = null;
        this.dbName = dbName;
        this.dbVersion = 1;
    }

    open(cb: ()=>void) {
        if (!window.indexedDB) {
            console.log("Браузер на поддерживает IndexedDB");
        }
        let openRequest = window.indexedDB.open(this.dbName, this.dbVersion);
    
        //подключемся к существующей в браузере БД
        openRequest.onsuccess = (e:Event) => {
            this.db = openRequest.result;
            cb();
        };
        //ошибка подключения
        openRequest.onerror = (e:Event) => {
            console.log("Error");
        };
        //если загружена БД старшей версии
        openRequest.onupgradeneeded = (e:IDBVersionChangeEvent) => {
            this.db = e.target!.result;
            this.db!.createObjectStore(ChartType.TEMP, {keyPath: 't'});
            this.db!.createObjectStore(ChartType.PREC, {keyPath: 't'});
            e.target!.transaction.oncomplete = () => {
                cb();
            };
        };
    }

    //закрываем соединение с БД
    close(){
        this.db?.close();
    }

    //добавляем новый элемент в БД
    add(storeName: string, data: ItemData) {
        if (this.db && data) {
             //транзакция на запись
            let transaction = this.db.transaction(storeName, "readwrite");
            let request = transaction.objectStore(storeName).add(data);
            request.onsuccess = (e:Event) => {
                
            };
        }
    }

    //получаем данные из БД
    get(storeName: string, start: string, end: string, cb: (data:ItemData[])=>void) {
        if (this.db) {
            //транзакция на чтение
            const txn = this.db.transaction(storeName, "readonly");
            const objectStore = txn.objectStore(storeName);
            //делаем запрос на получение данные внутри интервала
            let request = objectStore.getAll(IDBKeyRange.bound(start, end));
            //при успешном чтении вызываем callback
            request.onsuccess = (e:Event) => {
                cb(e.target!.result);
            };
            //обработка ошибки чтения
            request.onerror = (e:Event) => {
                cb([]);
            };
        }
    }

    //загружаем данные с сервера и записываем их в БД
    async getData(storeName: string, cb: (data:ItemData[])=>void) {
        //получаем данные с сервера
        let data = await getData<ItemData>(`../data/${storeName}.json`);

        //очищаем старую БД
        let request = this.db!.transaction(storeName, "readwrite").objectStore(storeName).clear();
        request.onsuccess = (e: Event) => {
            //транзакция на запись
            let transaction = this.db!.transaction(storeName, "readwrite");
            //каждый элемент данных записываем как отдельная запись в БД
            data.map((item:ItemData)=>{
                transaction.objectStore(storeName).add(item);
            });
            //после завершщения данных вызываем callback на работу с данными
            transaction.oncomplete = (e:Event) => {
                cb(data);
            }
        }
    }
}