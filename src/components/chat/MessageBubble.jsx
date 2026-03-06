const MessageBubble = ({msg,self})=>{

return(

<div className={`flex mb-2 ${self?"justify-end":"justify-start"}`}>

<div className={`px-4 py-2 rounded-lg max-w-xs
${self?"bg-blue-600 text-white":"bg-gray-200"}`}>

{msg.message}

{msg.file_url && (
<a
href={msg.file_url}
target="_blank"
className="block underline mt-1 text-sm"
>
Download file
</a>
)}

</div>

</div>

);

};

export default MessageBubble;