import { useEffect,useState } from "react"
import { supabase } from "../../services/supabaseClient"

const DocumentList = () => {

const [documents,setDocuments] = useState([])

useEffect(()=>{

loadDocuments()

},[])

async function loadDocuments(){

const { data:userData } = await supabase.auth.getUser()
const lawyerId = userData.user.id

const { data } = await supabase
.from("documents")
.select("*")
.eq("lawyer_id",lawyerId)
.order("created_at",{ascending:false})

setDocuments(data || [])

}

return(

<div>

<h2 className="text-xl font-semibold mb-4">
Client Documents
</h2>

<table className="w-full border">

<thead className="bg-gray-100">

<tr>

<th className="p-2 border">File</th>
<th className="p-2 border">Uploaded By</th>
<th className="p-2 border">Date</th>
<th className="p-2 border">Download</th>

</tr>

</thead>

<tbody>

{documents.map(doc => (

<tr key={doc.id}>

<td className="p-2 border">
{doc.file_name}
</td>

<td className="p-2 border">
{doc.uploaded_by}
</td>

<td className="p-2 border">
{new Date(doc.created_at).toLocaleDateString()}
</td>

<td className="p-2 border">

<a
href={doc.file_url}
target="_blank"
className="text-blue-600 underline"
>
Download
</a>

</td>

</tr>

))}

</tbody>

</table>

</div>

)

}

export default DocumentList