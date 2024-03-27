import { useState, useEffect } from 'react'
import { 
  Line,
  YAxis,
  Legend,
  Area,
  ResponsiveContainer,
  ComposedChart,
  Tooltip,
  ReferenceLine
} from "recharts"
import "./App.css"

function App() {
  const CHART_HEIGHT = 100

  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (socket) {
      socket.addEventListener("open", event => {
        setConnected(true)
      })

      socket.addEventListener("message", event => {
        const data = JSON.parse(event.data)
        setMessages(prevMessages => [...prevMessages, data])
      })

      return () => {
        socket.close()
      }
    }
  }, [socket])

  const connectToServer = () => {
    const socket = new WebSocket("ws://localhost:8765")
    setSocket(socket)
  }

  const disconnectFromServer = () => {
    if (socket) {
      socket.close()
      setSocket(null)
      setMessages([])
      setConnected(false)
    }
  }

  const totalWatts = messages.reduce((acc, message) => acc + message.watts, 0)
  const avgWatts = totalWatts / messages.length

  const Chart = (props) => {
    const { type, dataKey, height, stroke, fill, reference } = props

    if (type === "area") {
      return (
        <div className="grid grid-cols-12">
          <p className="flex font-semibold text-white items-center justify-center">{dataKey}</p>
          <ResponsiveContainer width="100%" height={height} className="col-span-10">
            <ComposedChart data={messages}>
              <Area type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} fill={fill} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
          {messages.length > 0 && (
            <p className="flex font-semibold text-white text-lg items-center justify-center">{messages.at(-1)[dataKey]}</p>
          )}
        </div>
      )
    }
    if (type === "line") {
      return (
        <div className="grid grid-cols-12">
          <p className="flex font-semibold text-white items-center justify-center">{dataKey}</p>
          <ResponsiveContainer width="100%" height={height} className="col-span-10">
            <ComposedChart data={messages}>
              <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} isAnimationActive={false} dot={false} />
              {reference && (
                <ReferenceLine y={reference} stroke={stroke} strokeDasharray="5 5" />
              )}
            </ComposedChart>
          </ResponsiveContainer>
          {messages.length > 0 && (
            <p className="flex font-semibold text-white items-center justify-center">{messages.at(-1)[dataKey]}</p>
          )}
        </div>
      )
    }
  }

  return (
    <div className="p-4">
      <div className="font-bold my-4">
        {!connected ? (
          <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={connectToServer}>
            Connect
          </button>
        ) : (
          <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={disconnectFromServer}>
            Disconnect
          </button>
        )}
      </div>
      <div className="bg-[#0b1215] rounded shadow">
        <p className="font-bold text-2xl text-white p-4">Afternoon Ride</p>
        <Chart type="area" dataKey="altitude" height={CHART_HEIGHT} stroke="#82ca9d" fill="#82ca9d"/>
        <Chart type="line" dataKey="velocity" height={CHART_HEIGHT} stroke="#8884d8"/>
        <Chart type="line" dataKey="watts" height={CHART_HEIGHT} stroke="#dc2625" reference={avgWatts} />
        <Chart type="line" dataKey="grade" height={CHART_HEIGHT} stroke="#ffc658"/>
      </div>
    </div>
  )
}

export default App
