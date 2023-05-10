let device_id = "2d5fc1"
let useQuery = false
let retcode_list =[
    "ssuc",
    "系统错误",
    "执行未加电",
    "I2C错误",
    "非法电源",
    
]
basic.forever(Update)
radio.onReceivedString(OnReceivedString)
input.onLogoEvent(TouchButtonEvent.Pressed, OnTouchButtonPressed)
Start()
function NewResponse(code:number,data: object){
    let ret_data :object ={
        "retcode": code,
        
        "msg":retcode_list[code], 
        "data" :data
    }
}
function OnTouchButtonPressed() {
    RemoteCall("OnTouchButtonPressed", null)
}
function OnReceivedString(receivedString: string) {
    CommonReceivedString(receivedString)
}
function RemoteCall(event_name: string, args: any = null) {
    let json_data_req = {
        "cmd":"remote_call_req",
        "event_name":event_name,
        "args":""
    }
    let str_data_req = JSON.stringify(json_data_req)
    if (args != null){
        json_data_req["args"] = JSON.stringify(args)
    }
    serial.writeLine(str_data_req)
}
function CommonSend(sendString:string){
    serial.writeLine(sendString)
    radio.sendString(sendString)
    
}
function CommonSendJson(json_data: object){
    CommonSend(JSON.stringify(json_data))
}
function CommonReceivedString(receivedString:string){
    let json_data_rsp = JSON.parse(receivedString)
    switch (json_data_rsp["cmd"]){
        case "remote_call_req":
            switch (json_data_rsp["event_name"]) {
                case "ButtonAPressed":
                    Forward(255)
                    json_data_rsp = NewResponse(0,{})
                    CommonSendJson(json_data_rsp)
                    break;
                case "ButtonBPressed":
                    Backoff(255)
                    json_data_rsp = NewResponse(0, {})
                    CommonSendJson(json_data_rsp)
                    break;
            }
            break;
        case "car_data_report_req":
            json_data_rsp = NewResponse(0, {})
            CommonSendJson(json_data_rsp)
            break;
    }
}
function RunMotor4(v1: number, v2: number, v3: number, v4: number) {
    SuperBit.MotorRun(SuperBit.enMotors.M1, v1)
    SuperBit.MotorRun(SuperBit.enMotors.M2, v2)
    SuperBit.MotorRun(SuperBit.enMotors.M3, v3)
    SuperBit.MotorRun(SuperBit.enMotors.M4, v4)
}
function Forward(speed: number) {
    RunMotor4(speed, speed, speed, speed)
}
function Backoff(speed: number) {
    RunMotor4(-speed, -speed, -speed, -speed)
}
function MoveLeft(speed: number) {
    RunMotor4(-speed, -speed, speed, speed)
}
function MoveRight(speed: number) {

}
function SpinLeft(speed: number) {

}
function SpinRight(speed: number) {

}
function Start() {
    serial.redirect(
        SerialPin.USB_TX,
        SerialPin.USB_RX,
        BaudRate.BaudRate115200
    )
    music.playMelody("E D G F B A C5 B ", 240)
    radio.setGroup(0)

    input.setAccelerometerRange(AcceleratorRange.OneG )

}
function Update() {

    let pitch = input.rotation(Rotation.Pitch)
    let acceleration_x = input.acceleration(Dimension.X)
    let acceleration_y = input.acceleration(Dimension.Y)
    let acceleration_z = input.acceleration(Dimension.Z)
    let compassHeading = input.compassHeading()
    let temperature = input.temperature()

    let json_data_req = {
        "cmd":"car_data_report_req",
        "acceleration_x": acceleration_x,
        "acceleration_y": acceleration_y,
        "acceleration_z": acceleration_z,
        "pitch" :pitch,
        "compassHeading": compassHeading,
        "temperature": temperature,

    } 
    CommonSendJson(json_data_req)
    if (input.buttonIsPressed(Button.A)) {
        RemoteCall("ButtonAPressed",null)
    }
    if (input.buttonIsPressed(Button.B)) {
        RemoteCall("ButtonBPressed", null)
    }
    let recevicedString = serial.readLine()
    if (recevicedString != ""){
        CommonReceivedString(recevicedString)
    }
}
