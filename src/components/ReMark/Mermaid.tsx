import mermaid, { type MermaidConfig } from 'mermaid';
import pako from 'pako';
import React, { useEffect, useState } from 'react';
import { LuExpand, LuMaximize, LuZoomIn, LuZoomOut } from 'react-icons/lu';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Md3Buttons } from '../../classNames/buttons';
import { CopyButton } from '../buttons/Copy';

interface MermaidProps {
  chart: string;
  config?: MermaidConfig;
}

const Mermaid: React.FC<MermaidProps> = ({ chart, config }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'strict',
      suppressErrorRendering: true,
      ...config,
    });
  }, [config]);

  useEffect(() => {
    const renderChart = async () => {
      try {
        const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render chart');
        console.error('Mermaid rendering error:', err);
      }
    };

    renderChart();
  }, [chart]);

  const getMermaidLiveLink = () => {
    const state = {
      code: chart,
      mermaid: { theme: 'default' },
      autoSync: true,
      updateDiagram: true,
    };
    const json = JSON.stringify(state);
    const compressed = pako.deflate(json, { level: 9 });
    const base64 = btoa(String.fromCharCode(...compressed));
    return `https://mermaid.live/view#pako:${base64}`;
  };

  if (error) {
    return (
      <div className='text-red-500 text-wrap'>
        Unable to render chart
        <br />
        [Error] {error}
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={10}
        centerOnInit
        smooth={true}
        wheel={{
          step: 0.05,
          smoothStep: 0.005,
        }}
        panning={{
          velocityDisabled: false,
          lockAxisX: false,
          lockAxisY: false,
        }}
        pinch={{
          step: 10,
          disabled: false,
        }}
        velocityAnimation={{
          sensitivity: 0.8,
          animationTime: 500,
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent wrapperClass='w-auto! min-h-[600px] max-h-[70vh] sm:max-h-[80vh] border border-outline/25 rounded-2xl bg-surface-container-lowest overflow-hidden'>
              <div className='relative min-w-full min-h-full'>
                <div className='absolute inset-0 w-[1000vh] h-[1000vh] -left-[500vh] -top-[500vh] bg-[radial-gradient(circle,_#d1d5db_1px,_transparent_1px)] opacity-50 bg-[size:20px_20px]' />
                {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
                <div className='relative z-10' dangerouslySetInnerHTML={{ __html: svg }} />
              </div>
            </TransformComponent>
            <div className='sm:flex mt-4'>
              <div className='flex justify-center gap-2 bg-secondary-container px-4 py-2 rounded-2xl'>
                <button onClick={() => zoomIn()} className={Md3Buttons.filledTonalIcon} type='button'>
                  <LuZoomIn />
                </button>
                <button onClick={() => zoomOut()} className={Md3Buttons.filledTonalIcon} type='button'>
                  <LuZoomOut />
                </button>
                <button onClick={() => resetTransform()} className={Md3Buttons.filledTonalIcon} type='button'>
                  <LuMaximize />
                </button>
                <a
                  href={getMermaidLiveLink()}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={Md3Buttons.filledTonalIcon}
                >
                  <LuExpand />
                </a>
                <CopyButton content={chart} className={Md3Buttons.filledTonalIcon} />
              </div>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default Mermaid;
