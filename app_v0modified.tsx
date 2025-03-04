"use client"

import { useState, useEffect } from "react"
import { Home, Settings, Grid, ArrowLeft, MessageSquare, DoorOpenIcon as Gate, Users, Lock } from "lucide-react"

export default function Component() {
  const [currentPage, setCurrentPage] = useState("home")
  const [unitNumber, setUnitNumber] = useState("") // GSM relay number
  const [password, setPassword] = useState("1234") // Default password
  const [newPassword, setNewPassword] = useState("") // For password change
  const [adminNumber, setAdminNumber] = useState("") // Admin phone number

  // State for authorized users
  const [authorizedUsers, setAuthorizedUsers] = useState([
    { serial: "001", phone: "", startTime: "", endTime: "" },
    { serial: "002", phone: "", startTime: "", endTime: "" },
    { serial: "003", phone: "", startTime: "", endTime: "" },
    { serial: "004", phone: "", startTime: "", endTime: "" },
    { serial: "005", phone: "", startTime: "", endTime: "" },
  ])

  // State for relay settings
  const [relaySettings, setRelaySettings] = useState({
    accessControl: "AUT", // AUT or ALL
    latchTime: "000", // Default latch time (000 for momentary)
  })

  useEffect(() => {
    // Load saved data from localStorage
    const savedUnitNumber = localStorage.getItem("unitNumber")
    const savedPassword = localStorage.getItem("password")
    const savedAdminNumber = localStorage.getItem("adminNumber")
    const savedAuthorizedUsers = localStorage.getItem("authorizedUsers")
    const savedRelaySettings = localStorage.getItem("relaySettings")

    if (savedUnitNumber) setUnitNumber(savedUnitNumber)
    if (savedPassword) setPassword(savedPassword)
    if (savedAdminNumber) setAdminNumber(savedAdminNumber)
    if (savedAuthorizedUsers) setAuthorizedUsers(JSON.parse(savedAuthorizedUsers))
    if (savedRelaySettings) setRelaySettings(JSON.parse(savedRelaySettings))
  }, [])

  // Save data to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem("unitNumber", unitNumber)
    localStorage.setItem("password", password)
    localStorage.setItem("adminNumber", adminNumber)
    localStorage.setItem("authorizedUsers", JSON.stringify(authorizedUsers))
    localStorage.setItem("relaySettings", JSON.stringify(relaySettings))
  }

  // SMS Commands
  const sendSMS = (command: string) => {
    const smsUrl = `sms:${unitNumber}?body=${encodeURIComponent(command)}`
    window.open(smsUrl, "_blank")
  }

  // Register Admin Number
  const registerAdmin = () => {
    if (!adminNumber) {
      alert("Please enter an admin phone number")
      return
    }
    sendSMS(`${password}TEL00${adminNumber}#`)
  }

  // Change Password
  const changePassword = () => {
    if (!newPassword || newPassword.length !== 4 || !/^\d+$/.test(newPassword)) {
      alert("Password must be 4 digits")
      return
    }
    sendSMS(`${password}P${newPassword}`)
    setPassword(newPassword)
    setNewPassword("")
    saveToLocalStorage()
  }

  // Manage Authorized Users
  const addAuthorizedUser = (index: number) => {
    const user = authorizedUsers[index]
    if (!user.phone) {
      alert("Please enter a phone number")
      return
    }

    let command = `${password}A${user.serial}#${user.phone}#`

    // Add time restrictions if provided
    if (user.startTime && user.endTime) {
      command += `${user.startTime}#${user.endTime}#`
    }

    sendSMS(command)
  }

  const deleteAuthorizedUser = (index: number) => {
    const user = authorizedUsers[index]
    sendSMS(`${password}A${user.serial}##`)

    // Clear the user data in state
    const newUsers = [...authorizedUsers]
    newUsers[index] = { ...newUsers[index], phone: "", startTime: "", endTime: "" }
    setAuthorizedUsers(newUsers)
  }

  // Relay Control Settings
  const setAccessControl = (type: string) => {
    const command = type === "ALL" ? `${password}ALL#` : `${password}AUT#`
    sendSMS(command)
    setRelaySettings({ ...relaySettings, accessControl: type })
  }

  const setLatchTime = () => {
    const latchTime = relaySettings.latchTime.padStart(3, "0")
    sendSMS(`${password}GOT${latchTime}#`)
  }

  // Control Relay
  const turnRelayOn = () => sendSMS(`${password}CC`)
  const turnRelayOff = () => sendSMS(`${password}DD`)

  const Header = ({ title, showBack = false, color = "bg-[#00bfff]", backTo = "home" }) => (
    <div className={`w-full ${color} text-white p-4 flex items-center`}>
      {showBack && (
        <button onClick={() => setCurrentPage(backTo)} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </button>
      )}
      <h1 className="text-2xl font-normal flex-1 text-center">{title}</h1>
    </div>
  )

  const DeviceInfo = () => (
    <div className="text-center my-4">
      {unitNumber && (
        <p className="text-xl mb-1">
          <span className="font-normal">Unit Telephone Number: </span>
          {unitNumber}
        </p>
      )}
    </div>
  )

  const Navigation = () => (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
      <div className="flex justify-around p-4">
        <button
          onClick={() => setCurrentPage("home")}
          className={`flex flex-col items-center ${currentPage === "home" ? "text-[#00bfff]" : "text-gray-400"}`}
        >
          <Home className="h-6 w-6" />
          <span className="text-sm">Home</span>
        </button>
        <button
          onClick={() => setCurrentPage("setup")}
          className={`flex flex-col items-center ${currentPage === "setup" ? "text-[#00bfff]" : "text-gray-400"}`}
        >
          <Settings className="h-6 w-6" />
          <span className="text-sm">Setup</span>
        </button>
        <button
          onClick={() => setCurrentPage("settings")}
          className={`flex flex-col items-center ${currentPage === "settings" ? "text-[#00bfff]" : "text-gray-400"}`}
        >
          <Grid className="h-6 w-6" />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  )

  const HomePage = () => (
    <div>
      <Header title="GSM Relay Control" />
      <DeviceInfo />
      <div className="p-4 space-y-4 mb-20">
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2">Step 5: Control the relay ON / OFF</h3>
          <p className="text-gray-600 mb-4">Control the gate by sending SMS commands</p>

          <button onClick={turnRelayOn} className="w-full border rounded-lg p-4 flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Gate className="h-12 w-12 text-[#00bfff]" />
              <span className="text-xl ml-4">Open Gate (ON)</span>
            </div>
            <MessageSquare className="h-6 w-6 text-[#00bfff]" />
          </button>
          <p className="text-sm text-gray-600 mb-4">Sends: "{password}CC" - Return SMS: Relay ON</p>

          <button onClick={turnRelayOff} className="w-full border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Gate className="h-12 w-12 text-[#00bfff]" />
              <span className="text-xl ml-4">Close Gate (OFF)</span>
            </div>
            <MessageSquare className="h-6 w-6 text-[#00bfff]" />
          </button>
          <p className="text-sm text-gray-600">Sends: "{password}DD" - Return SMS: Relay OFF</p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2">Current Settings</h3>
          <p className="text-lg">
            Access Control: {relaySettings.accessControl === "AUT" ? "Authorized Numbers Only" : "All Numbers"}
          </p>
          <p className="text-lg">
            Latch Time:{" "}
            {relaySettings.latchTime === "000"
              ? "Momentary (0.5s)"
              : `${Number.parseInt(relaySettings.latchTime)} seconds`}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2">Device Setup</h3>
          <p className="text-gray-600">Configure your GSM relay module</p>
          <button
            onClick={() => setCurrentPage("setup")}
            className="w-full bg-[#00bfff] text-white py-3 rounded-lg text-xl mt-2"
          >
            Go to Setup
          </button>
        </div>
      </div>
    </div>
  )

  const SetupPage = () => (
    <div>
      <Header title="GSM Relay Setup" />
      <div className="p-4 space-y-4 mb-20">
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold">Device Configuration</h3>
          <p className="text-gray-600 mb-4">Follow these steps to set up your GSM relay</p>

          <div>
            <label className="block text-lg mb-1">Unit Telephone Number</label>
            <input
              type="tel"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              placeholder="Enter GSM relay number"
              className="w-full p-2 border rounded mb-4"
            />
          </div>

          <button
            onClick={() => setCurrentPage("step1")}
            className="w-full border rounded-lg p-4 flex items-center justify-between mb-2"
          >
            <div className="flex items-center">
              <div className="bg-[#00bfff] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                1
              </div>
              <span className="text-lg">Register Admin Number</span>
            </div>
            <ArrowLeft className="h-6 w-6 transform rotate-180" />
          </button>

          <button
            onClick={() => setCurrentPage("step2")}
            className="w-full border rounded-lg p-4 flex items-center justify-between mb-2"
          >
            <div className="flex items-center">
              <div className="bg-[#00bfff] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                2
              </div>
              <span className="text-lg">Change Admin Password</span>
            </div>
            <ArrowLeft className="h-6 w-6 transform rotate-180" />
          </button>

          <button
            onClick={() => setCurrentPage("step3")}
            className="w-full border rounded-lg p-4 flex items-center justify-between mb-2"
          >
            <div className="flex items-center">
              <div className="bg-[#00bfff] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                3
              </div>
              <span className="text-lg">Authorized User Management</span>
            </div>
            <ArrowLeft className="h-6 w-6 transform rotate-180" />
          </button>

          <button
            onClick={() => setCurrentPage("step4")}
            className="w-full border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="bg-[#00bfff] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                4
              </div>
              <span className="text-lg">Relay Control Settings</span>
            </div>
            <ArrowLeft className="h-6 w-6 transform rotate-180" />
          </button>
        </div>

        <button
          onClick={() => {
            saveToLocalStorage()
            alert("Settings saved successfully!")
          }}
          className="w-full bg-green-500 text-white py-3 rounded-lg text-xl"
        >
          Save All Settings
        </button>
      </div>
    </div>
  )

  const Step1Page = () => (
    <div>
      <Header title="Step 1: Register Admin" showBack backTo="setup" />
      <div className="p-4 space-y-4 mb-20">
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2">Register Admin Number</h3>
          <p className="text-gray-600 mb-4">
            We have to register the Admin number to the relay. This number will have full control over the device.
          </p>

          <div>
            <label className="block text-lg mb-1">Admin Phone Number</label>
            <input
              type="tel"
              value={adminNumber}
              onChange={(e) => setAdminNumber(e.target.value)}
              placeholder="Example: 0469843459"
              className="w-full p-2 border rounded mb-2"
            />
            <p className="text-sm text-gray-600 mb-4">Format: Your country code + phone number</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg mb-4">
            <p className="font-medium">Command Format:</p>
            <p className="font-mono">PwdTEL00614xxxxxxxx#</p>
            <p className="text-sm text-gray-600 mt-1">Example: 1234TEL0061469843459#</p>
          </div>

          <button onClick={registerAdmin} className="w-full bg-[#00bfff] text-white py-3 rounded-lg text-xl">
            Send Registration SMS
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Will send: {password}TEL00{adminNumber || "xxxxxxxxxx"}#
          </p>
          <p className="text-sm text-gray-600 mt-1">Return SMS from Relay: Set Success!</p>
        </div>
      </div>
    </div>
  )

  const Step2Page = () => (
    <div>
      <Header title="Step 2: Change Password" showBack backTo="setup" />
      <div className="p-4 space-y-4 mb-20">
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2">Change Admin Password</h3>
          <p className="text-gray-600 mb-4">Change the 4-digit password for the GSM relay.</p>

          <div>
            <label className="block text-lg mb-1">Current Password</label>
            <input type="text" value={password} readOnly className="w-full p-2 border rounded bg-gray-100 mb-4" />
          </div>

          <div>
            <label className="block text-lg mb-1">New Password (4 digits)</label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
              placeholder="Enter new 4-digit password"
              maxLength={4}
              pattern="\d*"
              className="w-full p-2 border rounded mb-2"
            />
          </div>

          <div className="bg-gray-100 p-3 rounded-lg mb-4">
            <p className="font-medium">Command Format:</p>
            <p className="font-mono">pwdPnewpwd</p>
            <p className="text-sm text-gray-600 mt-1">Example: 1234P6666</p>
            <p className="text-sm text-gray-600 mt-1">This changes the password to 6666</p>
          </div>

          <button onClick={changePassword} className="w-full bg-[#00bfff] text-white py-3 rounded-lg text-xl">
            Change Password
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Will send: {password}P{newPassword || "xxxx"}
          </p>
        </div>
      </div>
    </div>
  )

  const Step3Page = () => (
    <div>
      <Header title="Step 3: Authorized Users" showBack backTo="setup" />
      <div className="p-4 space-y-4 mb-20">
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2">Authorized User Management</h3>
          <p className="text-gray-600 mb-2">
            The Authorized Number means the one who can dial the device to control the relay.
          </p>
          <p className="text-gray-600 mb-4">
            The Serial Number is the position to store the authorized users, from 001~200.
          </p>

          <div className="bg-gray-100 p-3 rounded-lg mb-4">
            <p className="font-medium">3.1: Add authorized user</p>
            <p className="font-mono">pwdA001#04xxxxxxxxx#</p>
            <p className="text-sm text-gray-600 mt-1">
              "A" command code for adding users followed by their serial number.
            </p>

            <p className="font-medium mt-3">3.2: Add user with time restrictions</p>
            <p className="font-mono">pwdA001#04xxxxxxxxx#2408050800#2409051000#</p>
            <p className="text-sm text-gray-600 mt-1">Example: 1234A016#123456#2408050800#2409051000#</p>
            <p className="text-sm text-gray-600">
              This sets phone number 123456 at position 16, with access from Aug 5th 8:00AM till Sep 5th 10:00AM.
            </p>

            <p className="font-medium mt-3">3.3: Delete authorized user</p>
            <p className="font-mono">pwdAserial number##</p>
            <p className="text-sm text-gray-600 mt-1">Example: 1234A002## to delete the 2nd authorized number.</p>
          </div>

          <button
            onClick={() => setCurrentPage("authorized-users")}
            className="w-full bg-[#00bfff] text-white py-3 rounded-lg text-xl"
          >
            Manage Authorized Users
          </button>
        </div>
      </div>
    </div>
  )

  const Step4Page = () => (
    <div>
      <Header title="Step 4: Relay Settings" showBack backTo="setup" />
      <div className="p-4 space-y-4 mb-20">
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2">Relay Control Settings</h3>

          <div className="bg-gray-100 p-3 rounded-lg mb-4">
            <p className="font-medium">4.1: Allow all numbers to call-in</p>
            <p className="font-mono">pwdALL#</p>
            <p className="text-sm text-gray-600 mt-1">Example: 1234ALL#</p>

            <p className="font-medium mt-3">4.2: Allow only authorized numbers (default)</p>
            <p className="font-mono">pwdAUT#</p>
            <p className="text-sm text-gray-600 mt-1">Example: 1234AUT#</p>

            <p className="font-medium mt-3">4.3: Set relay latch time</p>
            <p className="font-mono">pwdGOTclose time#</p>
            <p className="text-sm text-gray-600 mt-1">close time=000~999 seconds</p>
            <p className="text-sm text-gray-600">000: momentary (0.5s) - USE THIS FOR AUTOMATIC GATES</p>
            <p className="text-sm text-gray-600">999: always ON until next call</p>
            <p className="text-sm text-gray-600 mt-1">Example: 1234GOT030# to set relay close for 30 seconds</p>
          </div>

          <h4 className="text-lg font-medium mb-2">Access Control</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => setAccessControl("ALL")}
              className={`p-3 rounded-lg border-2 ${relaySettings.accessControl === "ALL" ? "border-[#00bfff] bg-blue-50" : "border-gray-300"}`}
            >
              <Users className="h-8 w-8 mx-auto mb-2 text-[#00bfff]" />
              <p className="text-center">Allow All Numbers</p>
            </button>
            <button
              onClick={() => setAccessControl("AUT")}
              className={`p-3 rounded-lg border-2 ${relaySettings.accessControl === "AUT" ? "border-[#00bfff] bg-blue-50" : "border-gray-300"}`}
            >
              <Lock className="h-8 w-8 mx-auto mb-2 text-[#00bfff]" />
              <p className="text-center">Authorized Only</p>
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Will send: {password}
            {relaySettings.accessControl === "ALL" ? "ALL#" : "AUT#"}
          </p>

          <h4 className="text-lg font-medium mb-2">Relay Latch Time</h4>
          <div>
            <label className="block text-sm mb-1">Latch Time (000-999 seconds)</label>
            <input
              type="number"
              value={Number.parseInt(relaySettings.latchTime)}
              onChange={(e) => {
                const value = Math.min(999, Math.max(0, Number.parseInt(e.target.value) || 0))
                setRelaySettings({ ...relaySettings, latchTime: value.toString().padStart(3, "0") })
              }}
              min="0"
              max="999"
              className="w-full p-2 border rounded mb-2"
            />
            <p className="text-sm text-gray-600 mb-4">000 = Momentary (0.5s), 999 = Always ON until next call</p>
          </div>

          <button onClick={setLatchTime} className="w-full bg-[#00bfff] text-white py-3 rounded-lg text-xl">
            Set Latch Time
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Will send: {password}GOT{relaySettings.latchTime}#
          </p>
        </div>
      </div>
    </div>
  )

  const AuthorizedUsersPage = () => (
    <div>
      <Header title="Authorized Users" showBack backTo="step3" />
      <div className="p-4 space-y-6 mb-20">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Manage Authorized Users</h2>
          <p className="text-lg">Add or remove users who can call the device to control the relay.</p>
          <p className="text-lg">Serial numbers range from 001 to 200.</p>
        </div>

        {authorizedUsers.map((user, index) => (
          <div key={index} className="space-y-4 border p-4 rounded-lg">
            <h3 className="text-xl text-[#00bfff]">User {Number.parseInt(user.serial)}</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-lg mb-1">Serial Number</label>
                <input
                  type="text"
                  value={user.serial}
                  onChange={(e) => {
                    const newUsers = [...authorizedUsers]
                    newUsers[index].serial = e.target.value.padStart(3, "0")
                    setAuthorizedUsers(newUsers)
                  }}
                  className="w-full p-2 border rounded"
                  maxLength={3}
                  pattern="\d*"
                />
              </div>
              <div>
                <label className="block text-lg mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={user.phone}
                  onChange={(e) => {
                    const newUsers = [...authorizedUsers]
                    newUsers[index].phone = e.target.value
                    setAuthorizedUsers(newUsers)
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-lg mb-1">Start Time (Optional)</label>
                  <input
                    type="text"
                    value={user.startTime}
                    onChange={(e) => {
                      const newUsers = [...authorizedUsers]
                      newUsers[index].startTime = e.target.value
                      setAuthorizedUsers(newUsers)
                    }}
                    placeholder="YYMMDDHHMM"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-lg mb-1">End Time (Optional)</label>
                  <input
                    type="text"
                    value={user.endTime}
                    onChange={(e) => {
                      const newUsers = [...authorizedUsers]
                      newUsers[index].endTime = e.target.value
                      setAuthorizedUsers(newUsers)
                    }}
                    placeholder="YYMMDDHHMM"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => addAuthorizedUser(index)}
                  className="flex-1 bg-[#00bfff] text-white py-2 rounded-lg"
                >
                  Add User
                </button>
                <button
                  onClick={() => deleteAuthorizedUser(index)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg"
                >
                  Delete User
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Add: {password}A{user.serial}#{user.phone || "xxxxxxxxxx"}#
                {user.startTime ? `${user.startTime}#${user.endTime}#` : ""}
              </p>
              <p className="text-sm text-gray-600">
                Delete: {password}A{user.serial}##
              </p>
            </div>
          </div>
        ))}

        <button onClick={saveToLocalStorage} className="w-full bg-green-500 text-white py-3 rounded-lg text-xl">
          Save User Settings
        </button>
      </div>
    </div>
  )

  const SettingsPage = () => (
    <div>
      <Header title="Settings" />
      <div className="p-4 space-y-4 mb-20">
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2">SMS Command Reference</h3>
          <div className="space-y-2">
            <p>
              <strong>Step 1:</strong> {password}TEL00{adminNumber || "xxxxxxxxxx"}#
            </p>
            <p>
              <strong>Step 2:</strong> {password}P[new 4-digit password]
            </p>
            <p>
              <strong>Step 3.1:</strong> {password}A[serial]#[phone]#
            </p>
            <p>
              <strong>Step 3.2:</strong> {password}A[serial]#[phone]#[start]#[end]#
            </p>
            <p>
              <strong>Step 3.3:</strong> {password}A[serial]##
            </p>
            <p>
              <strong>Step 4.1:</strong> {password}ALL#
            </p>
            <p>
              <strong>Step 4.2:</strong> {password}AUT#
            </p>
            <p>
              <strong>Step 4.3:</strong> {password}GOT[time]#
            </p>
            <p>
              <strong>Step 5 ON:</strong> {password}CC
            </p>
            <p>
              <strong>Step 5 OFF:</strong> {password}DD
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Device Settings</h2>
          <div>
            <label className="block text-lg mb-1">Unit Telephone Number</label>
            <input
              type="tel"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              placeholder="Enter GSM relay number"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-lg mb-1">Current Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
              maxLength={4}
              pattern="\d*"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          onClick={() => {
            saveToLocalStorage()
            alert("Settings saved successfully!")
          }}
          className="w-full bg-[#00bfff] text-white py-3 rounded-lg text-xl"
        >
          Save Settings
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      {currentPage === "home" && <HomePage />}
      {currentPage === "setup" && <SetupPage />}
      {currentPage === "step1" && <Step1Page />}
      {currentPage === "step2" && <Step2Page />}
      {currentPage === "step3" && <Step3Page />}
      {currentPage === "step4" && <Step4Page />}
      {currentPage === "authorized-users" && <AuthorizedUsersPage />}
      {currentPage === "settings" && <SettingsPage />}
      <Navigation />
    </div>
  )
}

