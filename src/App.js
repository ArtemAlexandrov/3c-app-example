import {PieChart} from 'react-minimal-pie-chart';
import CryptoJS from 'crypto-js';
import {useEffect, useState} from 'react'
import { Card, Table, Badge } from 'antd';

function getSig(path, secret) {
  return CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secret)
    .update(path)
    .finalize()
    .toString(CryptoJS.enc.Hex);
}
const useData = (method, path, defaultData) => {
  const [data, setData] = useState(defaultData)
  const API_KEY = new URLSearchParams(window.location.search).get("API_KEY") || "";
  const SECRET = new URLSearchParams(window.location.search).get("SECRET") || "";

  useEffect(() => {
    fetch(
      `https://api.3commas.io${path}`,
      {
        method: method,
        timeout: 30000,
        agent: '',
        headers: {
          'APIKEY': API_KEY,
          'Signature': getSig(path, SECRET)
        }
      }
    ).then(response => response.json()).then(setData)
  }, [path])
  return data
}

const COLORS = [
    "#23c6c8",
    "#1c84c6",
    "#f8ac59",
    "#ed5565",
    "#12b495",
    "#a83bb1",
    "#d26140",
    "#4060e4",
    "#ebdf33",
    "#0b8ca1",
    "#7740de",
    "#1a9d42",
    "#d63f70",
    "#59a5f8",
    "#7ddc33",
    "#65349d",
    "#aa831c",
  ]

const AccountChart = ({accountId}) => {
  const balances = useData("POST", `/public/api/ver1/accounts/${accountId}/account_table_data`, [])
return <Card title="Account" style={{width: 600}}>
    <PieChart
      data={
        balances.map((balance, index) => ({
          title: balance.currency_code,
          value: balance.percentage,
          color: COLORS[index % COLORS.length]
        }))
        }
    />
  <Table columns={[
    {title: "Color",
      dataIndex: 'percentage',
      render: (text, row, index) => {
      return <Badge
        count={parseInt(text)}
        style={{ backgroundColor: COLORS[index % COLORS.length] }} />
      }
    },
    {
    title: 'Currency',
    dataIndex: 'currency_code',
  }, {
    title: '$',
    dataIndex: 'usd_value',
      align:"right",
      render: (value) => parseFloat(value).toFixed(2)
  }]} dataSource={balances} size="small" />
  </Card>
}

function App() {
  const accounts = useData("GET", "/public/api/ver1/accounts", []);
  return (
    <div className="App">
      {accounts.map(({id}) => <AccountChart accountId={id} key={id} />)}
    </div>
  );
}

export default App;
