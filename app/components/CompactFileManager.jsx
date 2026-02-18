
'use client';
import { useState } from "react";
import { GrAdd, GrFormClose, GrDocumentZip} from "react-icons/gr";


const CompactFileManager = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setSelectedFiles((prev) => [...prev, ...newFiles]);
        e.target.value = '';
    };
    const removeFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return(
        <div className="w-full max-w-xl mx-auto space-y-6">
            {/* 1. STATE: EMPTY - Show Big Upload Box */}
            {selectedFiles.length === 0 ? (
            <label 
                htmlFor="file-upload" 
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group bg-[#111]"
            >
                <div className="p-4 rounded-full bg-blue-500/10 mb-4 group-hover:scale-110 transition-transform">
                    <GrAdd className="text-3xl text-blue-500" />
                </div>
                <p className="text-lg font-medium text-gray-200">Click to upload files</p>
                <p className="text-sm text-gray-500 mt-1">Images, Videos, or Documents</p>
                <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </label>
            ) : (
                /* 2. STATE: FILES ADDED - Show Header + Small Add Button */
                <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                        <div>
                        <h2 className="text-xl font-semibold text-gray-200">Selected Files</h2>
                        </div>
                            
                        {/* The Compact "Add More" Button */}
                        <label 
                            htmlFor="file-upload-more" 
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full cursor-pointer transition-colors group"
                        >
                            <GrAdd className="text-sm group-hover:rotate-90 transition-transform" />
                            <span className="text-sm font-medium">Add More</span>
                            <input id="file-upload-more" type="file" multiple className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>

                    {/* 3. The List of Added Files */}
                    <div className="grid gap-2">
                        {selectedFiles.map((file, index) =>(
                            <div key={`${file.name}-${index}`} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                    <GrDocumentZip />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                    <button onClick={() => removeFile(index)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-all">
                                        <GrFormClose className="text-xl" />
                                    </button>
                                </div>
                        ))}
                    </div>
                    
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]">
                        Convert All Files
                    </button>
                </div>
            )}
        </div>
    );
};

export default CompactFileManager;