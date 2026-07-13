import { useState } from "react"
import {
  changePassword,
  updateAccount,
  updateAvatar,
  updateCoverImage,
} from "../api/auth.api.js"
import { getErrorMessage } from "../api/axios.js"
import { useAuth } from "../../context/useAuth.js"
import Input from "../components/common/Input.jsx"
import Button from "../components/common/Button.jsx"
import Avatar from "../components/common/Avatar.jsx"

const EditProfile = () => {
  const { user, refetchUser } = useAuth()

  const [accountForm, setAccountForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" })

  const [accountMessage, setAccountMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [imageMessage, setImageMessage] = useState("")

  const [isSavingAccount, setIsSavingAccount] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  const handleAccountSubmit = async (e) => {
    e.preventDefault()
    setIsSavingAccount(true)
    setAccountMessage("")
    try {
      await updateAccount(accountForm)
      await refetchUser()
      setAccountMessage("Profile updated successfully")
    } catch (err) {
      setAccountMessage(getErrorMessage(err))
    } finally {
      setIsSavingAccount(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setIsSavingPassword(true)
    setPasswordMessage("")
    try {
      await changePassword(passwordForm)
      setPasswordForm({ oldPassword: "", newPassword: "" })
      setPasswordMessage("Password changed successfully")
    } catch (err) {
      setPasswordMessage(getErrorMessage(err))
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingAvatar(true)
    setImageMessage("")
    try {
      await updateAvatar(file)
      await refetchUser()
    } catch (err) {
      setImageMessage(getErrorMessage(err))
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingCover(true)
    setImageMessage("")
    try {
      await updateCoverImage(file)
      await refetchUser()
    } catch (err) {
      setImageMessage(getErrorMessage(err))
    } finally {
      setIsUploadingCover(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <h1 className="font-display text-lg font-semibold">Channel settings</h1>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Profile images
        </h2>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar src={user?.avatar} alt={user?.username} size="xl" />
            <label className="cursor-pointer text-xs text-amber hover:underline">
              {isUploadingAvatar ? "Uploading..." : "Change avatar"}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="h-16 w-full overflow-hidden rounded-md border border-line bg-surface2">
              {user?.coverImage ? (
                <img src={user.coverImage} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <label className="cursor-pointer text-xs text-amber hover:underline">
              {isUploadingCover ? "Uploading..." : "Change cover image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </label>
          </div>
        </div>
        {imageMessage ? <p className="mt-3 text-sm text-danger">{imageMessage}</p> : null}
      </section>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Account details
        </h2>
        <form onSubmit={handleAccountSubmit} className="flex flex-col gap-3">
          <Input
            label="Full name"
            value={accountForm.fullName}
            onChange={(e) => setAccountForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={accountForm.email}
            onChange={(e) => setAccountForm((f) => ({ ...f, email: e.target.value }))}
          />
          {accountMessage ? <p className="text-sm text-muted">{accountMessage}</p> : null}
          <Button type="submit" isLoading={isSavingAccount} className="w-fit">
            Save changes
          </Button>
        </form>
      </section>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Change password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          <Input
            label="Current password"
            type="password"
            value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, oldPassword: e.target.value }))}
            required
          />
          <Input
            label="New password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
            required
          />
          {passwordMessage ? <p className="text-sm text-muted">{passwordMessage}</p> : null}
          <Button type="submit" isLoading={isSavingPassword} className="w-fit">
            Update password
          </Button>
        </form>
      </section>
    </div>
  )
}

export default EditProfile
