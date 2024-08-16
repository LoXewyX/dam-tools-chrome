import { ChangeEvent } from 'preact/compat';
import { useSignalEffect, signal } from '@preact/signals';
import Calendar from './Calendar.tsx';

import imgLogo from '../assets/img/logo.jpg';
import imgMoodle from '../assets/img/moodle.png';
import imgIBC from '../assets/img/ibc.png';
import imgGithub from '../assets/img/github.svg';
import imgChatGPT from '../assets/img/chatgpt.png';
import Homework from './Homework.tsx';

interface StorageCheckboxProps {
  label: string;
  storageKey: string;
  checked: boolean;
  onChange: (newValue: boolean) => void;
}

const devtoolsVisible = signal(false);
const homeworkVisible = signal(false);

const currentTime = signal(new Date());

const isCheckedJsInjector = signal(false);
const scriptJsTextValue = signal('');
const isCheckedCssInjector = signal(false);
const scriptCssTextValue = signal('');

function StorageCheckbox({
  label,
  storageKey,
  checked,
  onChange,
}: StorageCheckboxProps) {
  return (
    <div className='mb-2'>
      <label>
        <input
          className='me-2'
          type='checkbox'
          checked={checked}
          onChange={async () => {
            onChange(!checked);
            await chrome.storage.local.set({ [storageKey]: !checked });
          }}
        />
        {label}
      </label>
    </div>
  );
}

interface StorageTextProps {
  label: string;
  storageKey: string;
  disabled?: boolean;
  value: string;
  onChange: (newValue: string) => void;
}

function StorageText({
  label,
  storageKey,
  disabled,
  value,
  onChange,
}: StorageTextProps) {
  const handleTextChange = (event: ChangeEvent) => {
    const newValue = (event.target as HTMLInputElement).value;
    onChange(newValue);
    chrome.storage.local.set({ [storageKey]: newValue });
  };

  return (
    <div className='mb-2'>
      <div>
        <label>{label}</label>
      </div>
      <div>
        <textarea
          className='w-100'
          type='text'
          value={value}
          disabled={!disabled}
          onChange={handleTextChange}
        ></textarea>
      </div>
    </div>
  );
}

function Home() {
  useSignalEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        } else {
          entry.target.classList.remove('show');
        }
      });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    chrome.storage.local.get('isCheckedJsInjector').then((result) => {
      const valueFromStorage = !!result.isCheckedJsInjector;
      if (valueFromStorage !== undefined) {
        isCheckedJsInjector.value = valueFromStorage;
      }
    });

    chrome.storage.local.get('scriptJsTextValue').then((result) => {
      const valueFromStorage = result.scriptJsTextValue;
      if (valueFromStorage !== undefined) {
        scriptJsTextValue.value = valueFromStorage;
      }
    });

    chrome.storage.local.get('isCheckedCssInjector').then((result) => {
      const valueFromStorage = !!result.isCheckedCssInjector;
      if (valueFromStorage !== undefined) {
        isCheckedCssInjector.value = valueFromStorage;
      }
    });

    chrome.storage.local.get('scriptCssTextValue').then((result) => {
      const valueFromStorage = result.scriptCssTextValue;
      if (valueFromStorage !== undefined) {
        scriptCssTextValue.value = valueFromStorage;
      }
    });
  });

  useSignalEffect(() => {
    chrome.storage.local.get('devtoolsVisible').then((result) => {
      const valueFromStorage = !!result.devtoolsVisible;
      if (valueFromStorage !== undefined) {
        devtoolsVisible.value = valueFromStorage;
      }
    });

    chrome.storage.local.get('homeworkVisible').then((result) => {
      const valueFromStorage = !!result.homeworkVisible;
      if (valueFromStorage !== undefined) {
        homeworkVisible.value = valueFromStorage;
      }
    });
  });

  const toggleDevtools = async () => {
    devtoolsVisible.value = !devtoolsVisible.value;
    await chrome.storage.local.set({ devtoolsVisible: devtoolsVisible.value });
  };

  const toggleHomework = async () => {
    homeworkVisible.value = !homeworkVisible.value;
    await chrome.storage.local.set({ homeworkVisible: homeworkVisible.value });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      } else {
        entry.target.classList.remove('show');
      }
    });
  });

  const hiddenElements = document.querySelectorAll('.hidden');
  hiddenElements.forEach((el) => observer.observe(el));

  const runAction = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeTab = tabs[0];
      
      // Check if activeTab is defined and has an id
      if (activeTab && activeTab.id !== undefined) {
        const tabId = activeTab.id; // TypeScript now knows tabId is a number
  
        if (isCheckedJsInjector.value) {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (textValue: string) => window.eval(textValue),
            args: [scriptJsTextValue.value],
          });
        }
  
        if (isCheckedCssInjector.value) {
          await chrome.scripting.insertCSS({
            target: { tabId: tabId },
            css: scriptCssTextValue.value,
          });
        } else {
          await chrome.scripting.removeCSS({
            target: { tabId: tabId },
            css: scriptCssTextValue.value,
          });
        }
      }
    });
  };
  
  

  useSignalEffect(() => {
    const interval = setInterval(() => {
      currentTime.value = new Date();
    }, 1000);
    return () => clearInterval(interval);
  });

  const formatTime = (time: Date) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    const pad = (value: number) => (value < 10 ? `0${value}` : value);

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <>
      <div className='card my-4 hidden'>
        <div className='row g-0'>
          <div className='col-4'>
            <img
              className='img-fluid rounded-start unselectable h-100'
              draggable={false}
              src={imgLogo}
              data-alt='dam-tool'
            />
          </div>
          <div className='col-8'>
            <div className='card-body'>
              <h4 className='card-title mt-2'>DAM Tools</h4>
              <div className='card-text mt-2'>
                Són les {formatTime(currentTime.value)}
              </div>
              <div className='card-text mt-1'>
                <small className='text-body-secondary me-3'>
                  Chrome build - v1.0.0
                </small>
                <div className='ms-2 mt-2'>
                  <a href='https://www.insbaixcamp.cat'>
                    <img
                      className='s26 me-2 unselectable'
                      draggable={false}
                      src={imgMoodle}
                      data-alt='Moodle'
                    />
                  </a>
                  <a href='https://www.insbaixcamp.org'>
                    <img
                      className='s26 me-2 unselectable'
                      draggable={false}
                      src={imgIBC}
                      data-alt='Ins Baix Camp'
                    />
                  </a>
                  <a href='https://github.com'>
                    <img
                      className='s26 me-2 unselectable'
                      draggable={false}
                      src={imgGithub}
                      data-alt='Github'
                    />
                  </a>
                  <a href='https://chatgpt.com'>
                    <img
                      className='s26 me-2 unselectable'
                      draggable={false}
                      src={imgChatGPT}
                      data-alt='ChatGPT'
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Calendar />

      <div className='card p-4 mb-4 shadow-sm hidden'>
        <h2 className='pointer draggable' onClick={toggleHomework}>
          <div
            className={
              'caret-btn' + (homeworkVisible.value ? ' rotate-90' : '')
            }
          >
            <div
              className='unselectable caret'
              draggable={false}
              data-alt={homeworkVisible.value ? 'CaretUp' : 'CaretDown'}
            />
          </div>
          Deures
        </h2>
        <div
          className={`${
            homeworkVisible.value ? 'ms-4 mt-2 mb-0' : 'd-none'
          } list-group`}
        >
          <Homework />
        </div>
      </div>

      <div className='card p-4 mb-4 shadow-sm hidden'>
        <h2 className='pointer draggable' onClick={toggleDevtools}>
          <div
            className={
              'caret-btn' + (devtoolsVisible.value ? ' rotate-90' : '')
            }
          >
            <div
              className='unselectable caret'
              draggable={false}
              data-alt={devtoolsVisible.value ? 'CaretUp' : 'CaretDown'}
            />
          </div>
          Extra
        </h2>
        <div
          className={`${
            devtoolsVisible.value ? 'ms-4 mt-2 mb-0 pt-4' : 'd-none'
          } list-group`}
        >
          <div className='mb-4'>
            <StorageCheckbox
              label='Injectar Javascript'
              storageKey='isCheckedJsInjector'
              checked={isCheckedJsInjector.value}
              onChange={(newValue) => (isCheckedJsInjector.value = newValue)}
            />
            <StorageText
              label='Script JS'
              storageKey='scriptJsTextValue'
              disabled={isCheckedJsInjector.value}
              value={scriptJsTextValue.value}
              onChange={(newValue) => (scriptJsTextValue.value = newValue)}
            />
          </div>
          <div className='mb-4'>
            <StorageCheckbox
              label='Injectar CSS'
              storageKey='isCheckedCssInjector'
              checked={isCheckedCssInjector.value}
              onChange={(newValue) => (isCheckedCssInjector.value = newValue)}
            />
            <StorageText
              label='Script CSS'
              storageKey='scriptCssTextValue'
              disabled={isCheckedCssInjector.value}
              value={scriptCssTextValue.value}
              onChange={(newValue) => (scriptCssTextValue.value = newValue)}
            />
          </div>
          <div className='text-center'>
            <button
              id='btnloader'
              className='btn3d btn btn-primary btn-lg'
              onClick={runAction}
            >
              Injectar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
