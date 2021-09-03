import React, { useState,useEffect } from "react";
import Button from "plaid-threads/Button";
import Note from "plaid-threads/Note";
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from "../Table";
import Error from "../Error";
import { DataItem, Categories, ErrorDataItem, Data } from "../../dataUtilities";

import styles from "./index.module.scss";
import internal from "stream";

interface Props {
  endpoint: string;
  name?: string;
  categories: Array<Categories>;
  schema: string;
  description: string;
  transformData: (arg: any) => Array<DataItem>;
}

const Transactions = (props: Props) => {
  const [showTable, setShowTable] = useState(false);
  const [transformedData, setTransformedData] = useState<Data>([]);
  const [pdf, setPdf] = useState<string | null>(null);
  const [error, setError] = useState<ErrorDataItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getData = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/${props.endpoint}`, { method: "GET" });
    const data = await response.json();
    if (data.error != null) {
      setError(data.error);
      setIsLoading(false);
      return;
    }

    // return console.log("checking data...",data);
    
    let result = props.transformData(data)
    result.map((item:any,index:any)=>{
      let rounded:any,balance:any

      let amount:Number

      // amount = parseFloat(item.amount.split(" ")[1])

      rounded = Math.ceil(item.amount.split(" ")[1].replace( ',', '')) + " " + item.amount.split(" ")[2]

      balance = '+ ' + (Math.ceil(item.amount.split(" ")[1].replace( ',', '')) - item.amount.split(" ")[1].replace( ',', '')).toFixed(2)
      
      result[index] = {...result[index],total:rounded,sats:balance} 
      
    })
    setTransformedData(result); // transform data into proper format for each individual product
    if (data.pdf != null) {
      setPdf(data.pdf);
    }
    setShowTable(true);
    setIsLoading(false);
  };

  useEffect(()=>{
    getData()
  },[props])

  return (
    <>
      {/* <div className={styles.endpointContainer}> */}
        {/* <Note info className={styles.post}>
          POST
        </Note>
        <div className={styles.endpointContents}>
          <div className={styles.endpointHeader}>
            {props.name != null && (
              <span className={styles.endpointName}>{props.name}</span>
            )}
            <span className={styles.schema}>{props.schema}</span>
          </div>
          <div className={styles.endpointDescription}>{props.description}</div>
        </div>
        <div className={styles.buttonsContainer}>
          <Button
            small
            centered
            wide
            secondary
            className={styles.sendRequest}
            onClick={getData}
          >
            {isLoading ? "Loading..." : `Send request`}
          </Button>
          {pdf != null && (
            <Button
              small
              centered
              wide
              className={styles.pdf}
              href={`data:application/pdf;base64,${pdf}`}
              componentProps={{ download: "Asset Report.pdf" }}
            >
              Download PDF
            </Button>
          )}
        </div>
      </div> */}
      {showTable ? (
        <Table
          categories={props.categories}
          data={transformedData}
          isIdentity={props.endpoint === "identity"}
        />
      ) : <CircularProgress disableShrink />}
      {error != null && <Error error={error} />}
    </>
  );
};

Transactions.displayName = "Transactions";

export default Transactions;
