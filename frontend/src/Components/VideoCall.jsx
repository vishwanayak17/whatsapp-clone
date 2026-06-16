import { FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi"
import { useState, useEffect } from "react"

function VideoCall({ myVideo, userVideo, stream, callAccepted, leaveCall, callType, userName }) {

  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)


  useEffect(() => {

    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream
    }

  }, [stream])


  useEffect(() => {

    if (userVideo.current && userVideo.current.srcObject) {

      userVideo.current.play()
      .catch(err => console.log("Remote video error:", err))

    }

  }, [callAccepted])


  const toggleMute = () => {

    if(stream){

      stream.getAudioTracks().forEach(track=>{
        track.enabled = !track.enabled
      })

      setIsMuted(!isMuted)

    }

  }


  const toggleVideo = () => {

    if(stream){

      stream.getVideoTracks().forEach(track=>{
        track.enabled = !track.enabled
      })

      setIsVideoOff(!isVideoOff)

    }

  }



  return (

    <div className="fixed inset-0 bg-black z-50 flex flex-col">


      <div className="absolute top-0 left-0 right-0 p-4 z-10">

        <p className="text-white font-semibold">
          {userName}
        </p>

        <p className="text-green-400 text-sm">

          {callAccepted ? "Connected" : "Calling..."}

        </p>

      </div>



      <div className="flex-1 flex items-center justify-center bg-gray-900">


        {callType === "video" ? (


          callAccepted ? (


            <video

              ref={userVideo}

              autoPlay

              playsInline

              className="w-full h-full object-cover"

            />


          ) : (


            <div className="text-center">


              <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white text-4xl mx-auto">

                {userName?.charAt(0)}

              </div>


              <p className="text-white mt-4">

                Calling {userName}...

              </p>


              <p className="text-gray-400">

                Waiting for answer...

              </p>


            </div>


          )


        ) : (


          <div className="text-center">

            <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center text-white text-5xl mx-auto">

              {userName?.charAt(0)}

            </div>

            <p className="text-white text-xl mt-4">

              {userName}

            </p>


          </div>


        )}


      </div>




      {callType === "video" && (

        <div className="absolute bottom-24 right-4 w-32 h-44 border-2 border-white rounded-xl overflow-hidden">


          <video

            ref={myVideo}

            autoPlay

            muted

            playsInline

            className="w-full h-full object-cover"

          />


        </div>


      )}




      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">


        <button

          onClick={toggleMute}

          className={`p-4 rounded-full text-white ${
            isMuted ? "bg-red-500" : "bg-gray-700"
          }`}

        >

          {isMuted ? <FiMicOff/> : <FiMic/>}

        </button>




        <button

          onClick={leaveCall}

          className="bg-red-600 text-white p-5 rounded-full"

        >

          <FiPhoneOff size={26}/>

        </button>




        {callType === "video" && (


          <button

            onClick={toggleVideo}

            className={`p-4 rounded-full text-white ${
              isVideoOff ? "bg-red-500" : "bg-gray-700"
            }`}

          >


            {isVideoOff ? <FiVideoOff/> : <FiVideo/>}


          </button>


        )}



      </div>


    </div>

  )

}


export default VideoCall