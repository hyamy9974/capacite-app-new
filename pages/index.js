import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [nomStructure, setNomStructure] = useState('');
  const [numEnregistrement, setNumEnregistrement] = useState('');

  useEffect(() => {
    const nom = localStorage.getItem('nomStructure') || '';
    const num = localStorage.getItem('numEnregistrement') || '';
    setNomStructure(nom);
    setNumEnregistrement(num);
  }, []);

  const handleNomChange = (e) => {
    setNomStructure(e.target.value);
    localStorage.setItem('nomStructure', e.target.value);
  };

  const handleNumChange = (e) => {
    setNumEnregistrement(e.target.value);
    localStorage.setItem('numEnregistrement', e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 max-w-3xl w-full text-center">
        {/* شعار Responsive: يعرض بحجم 360x60 على الشاشات الكبيرة ويصغر تلقائياً على الشاشات الصغيرة */}
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="Logo Ministère"
            width={360}
            height={60}
            className="mx-auto"
            style={{
              width: "360px",
              height: "60px",
              maxWidth: "100%",
              maxHeight: "40px",
              objectFit: "contain"
            }}
            // يمكن إزالة style إذا كان الشعار صغيراً جداً على الموبايل واستبداله بmax-w-full h-auto فقط
          />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Diagnostic de la Capacité d&apos;Accueil
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la structure
            </label>
            <input
              type="text"
              value={nomStructure}
              onChange={handleNomChange}
              className="w-full border p-2 rounded-md"
              placeholder="Centre de Formation XYZ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° d&apos;enregistrement
            </label>
            <input
              type="text"
              value={numEnregistrement}
              onChange={handleNumChange}
              className="w-full border p-2 rounded-md"
              placeholder="12345/2025"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-6 mb-6">
          <button
            onClick={() => router.push('/tda')}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow"
          >
            Diagnostic de l'état actuel
          </button>
          <button
            onClick={() => router.push('/tdp')}
            className="w-full md:w-auto bg-[#FFA500] hover:bg-[#e69500] text-white font-semibold py-3 px-6 rounded-xl shadow"
          >
            Diagnostic de l'état prévu
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Version : <strong>V1.0</strong>
        </p>
      </div>
    </div>
  );
}