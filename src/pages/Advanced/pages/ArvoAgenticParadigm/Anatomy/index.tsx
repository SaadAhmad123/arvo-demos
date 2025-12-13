import { useState } from 'react';
import { Md3Cards } from '../../../../../classNames/cards';
import { TopicViewer } from './Viewer';
import { topicsMap } from './topics';
import { CopyButton } from '../../../../../components/buttons/Copy';

export const ArvoAgentAnatomy: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<keyof typeof topicsMap | null>(null);

  const onClick = (topic: keyof typeof topicsMap) => () => {
    setSelectedTopic(topic);
  };

  const getButtonClass = (topic: keyof typeof topicsMap, baseClass: string) => {
    const isSelected = selectedTopic === topic;
    return `${baseClass} ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest' : ''}`;
  };

  const getCategory = (topic: keyof typeof topicsMap): 'resumable' | 'agentic' | 'engine' => {
    const engineTopics = [
      'priorityManager',
      'permissionsManager',
      'localToolsExecutor',
      'mcpClientIntegration',
      'eventEmissionManager',
    ];
    const agenticTopics = [
      'actionsRegistry',
      'contextManager',
      'llmIntegration',
      'streaming',
      'feedbackManager',
      'actionInteractionManager',
    ];

    if (engineTopics.includes(topic)) return 'engine';
    if (agenticTopics.includes(topic)) return 'agentic';
    return 'resumable';
  };

  return (
    <>
      <section className='grid grid-cols-1 border border-outline/20 bg-surface-container-lowest rounded-3xl overflow-x-auto '>
        <div className='min-w-[800px]'>
          <div className='grid grid-cols-12 gap-3 p-4 text-on-surface'>
            <div className='col-span-12 text-lg flex items-center justify-start gap-2'>
              <CopyButton
                content={Object.entries(topicsMap)
                  .map(([key, value]) => `---\nCategory: ${getCategory(key as keyof typeof topicsMap)}\n${value}`)
                  .join('\n\n')}
              />
              <h1 className='text-center'>ArvoResumable</h1>
            </div>
            <button
              type='button'
              className={getButtonClass(
                'exectionManager',
                `${Md3Cards.filled} bg-surface-container-low! col-span-6 p-4 text-lg cursor-pointer hover:bg-surface-container! transition-all`,
              )}
              onClick={onClick('exectionManager')}
            >
              The Execution Manager
            </button>
            <button
              type='button'
              className={getButtonClass(
                'stateManager',
                `${Md3Cards.filled} bg-surface-container-low! col-span-6 p-4 text-lg cursor-pointer hover:bg-surface-container! transition-all`,
              )}
              onClick={onClick('stateManager')}
            >
              State Management
            </button>
            <div className={`${Md3Cards.filled} bg-surface-container-low! col-span-8 p-4 grid grid-cols-12 gap-2`}>
              <h1 className='col-span-12 text-lg mb-2 text-center'>Agentic Implementation</h1>
              <div className='col-span-6 grid grid-cols-12 gap-2'>
                <button
                  type='button'
                  className={getButtonClass(
                    'actionsRegistry',
                    `${Md3Cards.filled} bg-surface-container-high! col-span-6 p-4 flex items-center justify-center text-lg hover:bg-surface-container-highest! cursor-pointer transition-all`,
                  )}
                  onClick={onClick('actionsRegistry')}
                >
                  Actions Registry
                </button>
                <button
                  type='button'
                  className={getButtonClass(
                    'contextManager',
                    `${Md3Cards.filled} bg-surface-container-high! col-span-6 p-4 flex items-center justify-center text-lg hover:bg-surface-container-highest! cursor-pointer transition-all`,
                  )}
                  onClick={onClick('contextManager')}
                >
                  Context Manager
                </button>
                <button
                  type='button'
                  className={getButtonClass(
                    'llmIntegration',
                    `${Md3Cards.filled} bg-surface-container-high! col-span-8 p-4 flex items-center justify-center text-lg hover:bg-surface-container-highest! cursor-pointer transition-all`,
                  )}
                  onClick={onClick('llmIntegration')}
                >
                  LLM Integration
                </button>
                <button
                  type='button'
                  className={getButtonClass(
                    'streaming',
                    `${Md3Cards.filled} bg-surface-container-high! col-span-4 p-4 flex items-center justify-center text-xs sm:text-sm hover:bg-surface-container-highest! cursor-pointer transition-all`,
                  )}
                  onClick={onClick('streaming')}
                >
                  Stream Manager
                </button>
                <button
                  type='button'
                  className={getButtonClass(
                    'feedbackManager',
                    `${Md3Cards.filled} bg-surface-container-high! col-span-6 p-4 flex items-center justify-center text-lg hover:bg-surface-container-highest! cursor-pointer transition-all`,
                  )}
                  onClick={onClick('feedbackManager')}
                >
                  Feedback Manager
                </button>
                <button
                  type='button'
                  className={getButtonClass(
                    'actionInteractionManager',
                    `${Md3Cards.filled} bg-surface-container-high! col-span-6 p-4 flex items-center justify-center text-lg hover:bg-surface-container-highest! cursor-pointer transition-all`,
                  )}
                  onClick={onClick('actionInteractionManager')}
                >
                  Action Interaction Manager
                </button>
              </div>
              <div className={`${Md3Cards.filled} col-span-6 grid grid-cols-12 gap-2 p-4 border border-outline/20`}>
                <h1 className='col-span-12 text-lg mb-2 text-center'>Actions Engine</h1>
                <button
                  type='button'
                  className={getButtonClass(
                    'priorityManager',
                    `${Md3Cards.filled} bg-surface-container-highest! col-span-12 p-4 text-lg hover:bg-primary/20! cursor-pointer transition-all`,
                  )}
                  onClick={onClick('priorityManager')}
                >
                  Priority Manager
                </button>
                <button
                  type='button'
                  className={getButtonClass(
                    'permissionsManager',
                    `${Md3Cards.filled} bg-surface-container-highest! col-span-12 p-4 text-lg hover:bg-primary/20! cursor-pointer transition-all`,
                  )}
                  onClick={onClick('permissionsManager')}
                >
                  Permissions Manager
                </button>
                <button
                  type='button'
                  className={getButtonClass(
                    'localToolsExecutor',
                    `${Md3Cards.filled} bg-surface-container-highest! col-span-6 p-4 text-normal hover:bg-primary/20! cursor-pointer transition-all`,
                  )}
                  onClick={onClick('localToolsExecutor')}
                >
                  Local Tools Executor
                </button>
                <button
                  type='button'
                  className={getButtonClass(
                    'mcpClientIntegration',
                    `${Md3Cards.filled} bg-surface-container-highest! col-span-6 p-4 text-normal hover:bg-primary/20! cursor-pointer transition-all`,
                  )}
                  onClick={onClick('mcpClientIntegration')}
                >
                  MCP Client Integration
                </button>
                <button
                  type='button'
                  className={getButtonClass(
                    'eventEmissionManager',
                    `${Md3Cards.filled} bg-surface-container-highest! col-span-12 p-4 text-lg hover:bg-primary/20! cursor-pointer transition-all`,
                  )}
                  onClick={onClick('eventEmissionManager')}
                >
                  Event Emissions Manager
                </button>
              </div>
            </div>
            <div className='col-span-4 grid gap-2'>
              <button
                type='button'
                className={getButtonClass(
                  'eventValidation',
                  `${Md3Cards.filled} bg-surface-container-low! p-4  text-lg cursor-pointer hover:bg-surface-container! transition-all`,
                )}
                onClick={onClick('eventValidation')}
              >
                Input Event Validation
              </button>
              <button
                type='button'
                className={getButtonClass(
                  'versionManagement',
                  `${Md3Cards.filled} bg-surface-container-low! p-4  text-lg cursor-pointer hover:bg-surface-container! transition-all`,
                )}
                onClick={onClick('versionManagement')}
              >
                Version Management
              </button>
              <button
                type='button'
                className={getButtonClass(
                  'eventEmissionAndValidation',
                  `${Md3Cards.filled} bg-surface-container-low! p-4  text-lg cursor-pointer hover:bg-surface-container! transition-all`,
                )}
                onClick={onClick('eventEmissionAndValidation')}
              >
                Event Emission and Validation
              </button>
              <button
                type='button'
                className={getButtonClass(
                  'errorBoundaryManager',
                  `${Md3Cards.filled} bg-surface-container-low! p-4  text-lg cursor-pointer hover:bg-surface-container! transition-all`,
                )}
                onClick={onClick('errorBoundaryManager')}
              >
                Error Boundary Management
              </button>
              <button
                type='button'
                className={getButtonClass(
                  'otelManager',
                  `${Md3Cards.filled} bg-surface-container-low! p-4  text-lg cursor-pointer hover:bg-surface-container! transition-all`,
                )}
                onClick={onClick('otelManager')}
              >
                OTEL Management
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedTopic && (
        <div className='mt-4'>
          <TopicViewer
            content={topicsMap[selectedTopic]}
            onClose={() => setSelectedTopic(null)}
            category={getCategory(selectedTopic)}
          />
        </div>
      )}
    </>
  );
};
