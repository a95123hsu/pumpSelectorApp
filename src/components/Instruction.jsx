import React from 'react';
import { useAppContext } from '../context/AppContext';

const Instruction = ({ onClose }) => {
  const { language, darkMode } = useAppContext();

  // Function to get the appropriate text based on language
  const getText = (key, lang = language) => {
    const translations = {
      "English": {
        "Instructions": "How to Use the Pump Selection Tool",
        "Close": "Close",
        "Step1Title": "Step 1: Set Basic Criteria",
        "Step1Content": "Begin by selecting the pump category and other basic criteria like frequency, phase, and outlet size. These filters will narrow down your search results based on your specific requirements.",
        "Step2Title": "Step 2: Input Application Details",
        "Step2Content": "For applications like booster systems or pond drainage, enter details such as the number of floors, faucets, or pond dimensions. The system will calculate recommended flow rate and head values.",
        "Step3Title": "Step 3: Specify Flow Rate and Head Requirements",
        "Step3Content": "Enter your specific flow rate and head requirements. Adjust the tolerance range using the sliders to broaden or narrow your search. You can also set Max Flow and Max Head limits to filter pumps by their maximum performance capabilities.",
        "Step4Title": "Step 4: Search and Review Results",
        "Step4Content": "Click the Search button to find matching pumps. Review the results table showing pumps that meet your criteria. If no pumps match, try increasing the tolerance settings.",
        "Step5Title": "Step 5: Compare and Select Pumps",
        "Step5Content": "Select one or more pumps from the results to view and compare their performance curves. This visual representation helps you choose the most suitable pump for your application.",
        "Tips": "Helpful Tips:",
        "Tip1": "Use the column selection to customize which pump attributes are displayed in the results table.",
        "Tip2": "Export results to CSV for further analysis or sharing.",
        "Tip3": "If no results are found, try increasing the flow or head tolerance settings.",
        "Tip4": "For booster applications, the system calculates flow based on faucets and head based on floors.",
        "Tip5": "For pond drainage, the system calculates flow based on volume and drain time.",
        "Tip6": "Use Max Flow and Max Head filters to set upper limits on pump performance for your application.",
        "ContactSupport": "Need additional help? Contact our support team through the AI chatbot in the bottom right corner."
      },
      "繁體中文": {
        "Instructions": "如何使用水泵選型工具",
        "Close": "關閉",
        "Step1Title": "步驟 1：設置基本條件",
        "Step1Content": "首先選擇泵類別和其他基本條件，如頻率、相數和出水口徑。這些過濾器將根據您的特定要求縮小搜索結果範圍。",
        "Step2Title": "步驟 2：輸入應用詳情",
        "Step2Content": "對於增壓系統或池塘排水等應用，輸入樓層數、水龍頭數量或池塘尺寸等詳情。系統將計算推薦的流量和揚程值。",
        "Step3Title": "步驟 3：指定流量和揚程要求",
        "Step3Content": "輸入您的特定流量和揚程要求。使用滑塊調整容差範圍以擴大或縮小搜索範圍。您還可以設置最大流量和最大揚程限制，根據幫浦的最大性能能力進行篩選。",
        "Step4Title": "步驟 4：搜尋並審查結果",
        "Step4Content": "點擊搜尋按鈕找到匹配的泵。查看結果表，顯示符合您條件的泵。如果沒有匹配的泵，請嘗試增加容差設置。",
        "Step5Title": "步驟 5：比較和選擇泵",
        "Step5Content": "從結果中選擇一個或多個泵來查看和比較它們的性能曲線。這種視覺化表示有助於您選擇最適合您應用的泵。",
        "Tips": "實用提示：",
        "Tip1": "使用欄位選擇來自定義結果表中顯示的泵屬性。",
        "Tip2": "將結果導出為CSV格式，方便進一步分析或共享。",
        "Tip3": "如果找不到結果，請嘗試增加流量或揚程容差設置。",
        "Tip4": "對於增壓應用，系統根據水龍頭計算流量，根據樓層計算揚程。",
        "Tip5": "對於池塘排水，系統根據體積和排水時間計算流量。",
        "Tip6": "使用最大流量和最大揚程過濾器為您的應用設置幫浦性能的上限。",
        "ContactSupport": "需要其他幫助？通過右下角的AI聊天機器人聯繫我們的支援團隊。"
      }
    };
    
    return translations[lang]?.[key] || key;
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${darkMode ? 'bg-black bg-opacity-80' : 'bg-gray-600 bg-opacity-75'}`}>
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-lg shadow-xl ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{getText("Instructions")}</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-opacity-80 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Step 1 */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {getText("Step1Title")}
            </h3>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p>{getText("Step1Content")}</p>
              <div className="mt-3">
                <img 
                  src="/images/instructions/step1.png" 
                  alt="Basic Criteria Selection" 
                  className="rounded-lg shadow-md border w-full max-w-2xl mx-auto my-2"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {getText("Step2Title")}
            </h3>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p>{getText("Step2Content")}</p>
              <div className="mt-3">
                <img 
                  src="/images/instructions/step2.png" 
                  alt="Application Details Input" 
                  className="rounded-lg shadow-md border w-full max-w-2xl mx-auto my-2"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {getText("Step3Title")}
            </h3>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p>{getText("Step3Content")}</p>
              <div className="mt-3">
                <img 
                  src="/images/instructions/step3.png" 
                  alt="Flow and Head Requirements" 
                  className="rounded-lg shadow-md border w-full max-w-2xl mx-auto my-2"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {getText("Step4Title")}
            </h3>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p>{getText("Step4Content")}</p>
              <div className="mt-3">
                <img 
                  src="/images/instructions/step4.png" 
                  alt="Search Results" 
                  className="rounded-lg shadow-md border w-full max-w-2xl mx-auto my-2"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            </div>
          </div>
          
          {/* Step 5 */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {getText("Step5Title")}
            </h3>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p>{getText("Step5Content")}</p>
              <div className="mt-3">
                <img 
                  src="/images/instructions/step5.png" 
                  alt="Pump Comparison" 
                  className="rounded-lg shadow-md border w-full max-w-2xl mx-auto my-2"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            </div>
          </div>
          
          {/* Tips Section */}
          <div className="mt-8">
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
              {getText("Tips")}
            </h3>
            <ul className={`list-disc pl-5 space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>{getText("Tip1")}</li>
              <li>{getText("Tip2")}</li>
              <li>{getText("Tip3")}</li>
              <li>{getText("Tip4")}</li>
              <li>{getText("Tip5")}</li>
              <li>{getText("Tip6")}</li>
            </ul>
          </div>
          
          {/* Support Contact */}
          <div className={`mt-8 p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p>{getText("ContactSupport")}</p>
          </div>
        </div>
        
        {/* Footer with close button */}
        <div className={`sticky bottom-0 z-10 px-6 py-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md font-medium ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {getText("Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instruction;
