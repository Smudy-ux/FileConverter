
'use client';
import { GrAdd } from "react-icons/gr";


const FileInputButton = () => {

    const handleFileChange = (event) => {
        const files = event.target.files;

        if(files && files.length > 0) {
            console.log('Selected files:', files)
        }
    }
    return(
        <div className="flex flex-col items-center gap-4 border-2 border-dashed border-gray-600 rounded-2xl p-40 bg-blue-300/5">
            <label 
                htmlFor="file-upload" 
                className="cursor-pointer p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-blue-500/50 transition-all group flex flex-col items-center gap-2"
            >
                <GrAdd className="text-2xl group-hover:text-blue-400 transition-colors" />
                <span className="text-sm text-gray-400 group-hover:text-gray-200">Click to upload</span>
                
                <input 
                type="file" 
                id="file-upload" 
                multiple 
                className="hidden" 
                onChange={handleFileChange} 
                />
            </label>
        </div>
    );
}

export default FileInputButton;