import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const STAGE = {
  TYPING: 'typing',
  PAUSING: 'pausing',
  COMPLETE: 'complete',
};

const KDM = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState('');
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [stage, setStage] = useState(STAGE.TYPING);

  const paragraphs = [
    'Pernah stres dikejar-kejar deadline untuk laporan?', 
    'Pernah merasa malas membuat laporan, tapi tetap harus dikerjakan?', 
    'Pernah merasa capek luar biasa setelah seharian mengurus semuanya?', 
    'Membimbing anak-anak, mencatat kehadiran, menggiring shalat, menggiring sekolah, nerima setoran hafalan, piket, mandi, makan, sampai urusan uang jajan.', 
    'Tonton video ini sebelum kamu nyerah sama keadaan...!!!'
  ];

  const currentText = paragraphs[paragraphIndex];
  const isLastParagraph = paragraphIndex === paragraphs.length - 1;

  useEffect(() => {
    let interval: number;

    switch (stage) {
      case STAGE.TYPING:
        if ((displayedText?.length ?? 0) < currentText.length) {
          interval = window.setInterval(() => {
            setDisplayedText((prev) => (prev ?? '') + currentText[prev?.length ?? 0]);
          }, 45);
        } else {
          setStage(STAGE.PAUSING);
        }
        break;

      case STAGE.PAUSING:
        interval = window.setTimeout(() => {
          if (isLastParagraph) {
            setStage(STAGE.COMPLETE);
          } else {
            setDisplayedText('');
            setParagraphIndex((prev) => prev + 1);
            setStage(STAGE.TYPING);
          }
        }, 1500);
        break;

      case STAGE.COMPLETE:
        break;

      default:
        break;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [displayedText, stage, currentText, isLastParagraph]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--brand-kdm-light))] to-[hsl(var(--brand-kdm))] p-4 font-['Roboto']">
      <div className="w-full max-w-4xl">
        <Card className="shadow-2xl border-2 border-blue-100 rounded-2xl">
          <CardContent className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#5e17eb] to-[#e88b00] bg-clip-text text-transparent mb-4">
                KDM 1.0 - Karim Dashboard Manager
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-[#5e17eb] to-[#e88b00] mx-auto rounded-full"></div>
            </div>

            {/* Typing Animation */}
            <div className="mb-4 min-h-[50px] md:min-h-[70px] text-center">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
                {displayedText} 
                {stage !== STAGE.COMPLETE && stage !== STAGE.PAUSING && (
                  <span className="animate-pulse">|</span>
                )}
              </p>
            </div>

            {/* Video & CTA */}
            {stage === STAGE.COMPLETE && (
              <div className="space-y-4 pt-4 animate-fade-in">
                <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden shadow-xl">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/UQSt0ncr_Ug"
                    title="KDM Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="text-center space-y-4 pt-4">
                  <p className="text-xl md:text-2xl font-bold text-gray-800">
                    Siap beralih ke sistem digital?
                  </p>
                  <Button
                    onClick={() => navigate('/signup')}
                    size="lg"
                    className="bg-gradient-to-r from-[#5e17eb] to-[#e88b00] hover:from-[#5e17eb] hover:to-[#e88b00] text-white font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Daftar Sekarang
                    <ArrowRight className="ml-2 h-5 w-5 inline-block" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KDM;
