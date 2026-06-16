import React from "react"
import { FiPhone, FiPhoneOff } from "react-icons/fi"

function IncomingCall({ call, answerCall, rejectCall }) {
  if (!call?.isReceivingCall) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl text-center w-[300px]">

        <h2 className="text-lg font-semibold mb-2">
          Incoming {call.callType} call
        </h2>

        <p className="text-gray-500 mb-6">
          User is calling you...
        </p>

        <div className="flex justify-center gap-6">

          <button
            onClick={answerCall}
            className="bg-green-500 text-white p-3 rounded-full"
          >
            <FiPhone size={22} />
          </button>

          <button
            onClick={rejectCall}
            className="bg-red-500 text-white p-3 rounded-full"
          >
            <FiPhoneOff size={22} />
          </button>

        </div>

      </div>
    </div>
  )
}

export default IncomingCall