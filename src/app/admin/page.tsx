import { redirect } from 'next/navigation'

export default function AdminRoot() {
    redirect('/admin/masters')
    return null
}
