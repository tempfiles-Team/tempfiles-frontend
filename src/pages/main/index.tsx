import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bindActionCreators } from 'redux';

import {
  CheckBox,
  PasswordInput,
  UpLoadButton,
  FileFind,
  Progress,
  DownloadCountSlider,
  ExpireTime,
} from '../../components';
import { actionCreators } from '../../state';
import { getFileSize, getTime } from '../../utils';
import * as S from './styled';

export const MainPage: React.FC = () => {
  const typingText = ['.', '..', '...'];
  const [typingCount, setTypingCount] = useState(0);
  const [uploading, setUploading] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  const [progressStateText, setProgressStateText] = useState('uploading');

  const [expireTimeBoolean, setExpireTimeBoolean] = useState(false);
  const [downloadCountBoolean, setDownloadCountBoolean] = useState(false);
  const [passwordBoolean, setPasswordBoolean] = useState(false);
  const [passwordFilter, setPasswordFilter] = useState(true);

  const [expireTime, setExpireTime] = useState(1);
  const [downloadCount, setDownloadCount] = useState(100);
  const [password, setPassword] = useState('');

  const [fileProps, setFileProps] = useState({
    filename: '',
    size: '',
    fileType: '',
    fileData: '',
  });

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { SetDownloadFileProps } = bindActionCreators(actionCreators, dispatch);

  const handleChangeFile = (event: any) => {
    setFileProps({
      filename: event.target.files[0].name,
      size: getFileSize(event.target.files[0].size),
      fileType:
        event.target.files[0].type === '' ? 'application/actet-stream' : event.target.files[0].type,
      fileData: event.target.files[0],
    });
  };

  const UpLoad = async () => {
    if (fileProps.filename != '' && fileProps.size != '') {
      const formdata = new FormData();
      formdata.append('file', fileProps.fileData);
      await axios({
        method: 'post',
        url: `${process.env.REACT_APP_BACKEND_BASEURL}/upload${
          passwordBoolean && password != '' && password != undefined ? `?pw=${password}` : ''
        }`,
        data: formdata,
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Download-Limit': downloadCountBoolean ? downloadCount : 100,
          'X-Time-Limit': expireTimeBoolean ? expireTime : 180,
        },
        onUploadProgress(progress) {
          setUploading(false);
          setProgressValue(Math.floor((progress.loaded / progress.total) * 100));
          if (Math.floor((progress.loaded / progress.total) * 100) === 100) {
            setProgressStateText('????????? ?????????');
          }
        },
      })
        .then(async (res) => {
          setUploading(true);
          toast.success('????????? ??????!', {
            autoClose: 3000,
            position: toast.POSITION.BOTTOM_RIGHT,
          });
          SetDownloadFileProps({
            fileId: res.data.fileId,
            token: res.data.isEncrypted ? res.data.token : null,
            isEncrypted: res.data.isEncrypted,
            //????????? ??????,?????????????????? ????????????
          });
          navigate(`/download/${res.data.fileId}`);
        })
        .catch((err) => {
          console.log(err);
          toast.error('????????? ??????..', {
            autoClose: 3000,
            position: toast.POSITION.BOTTOM_RIGHT,
          });
          setUploading(true);
        });
    } else {
      toast.error('????????? ??????????????????!', {
        autoClose: 3000,
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };
  useEffect(() => {
    const typingInterval = setInterval(() => {
      setTypingCount(typingCount + 1);
      if (typingCount >= 2) {
        setTypingCount(0);
      }
    }, 500);
    return () => {
      clearInterval(typingInterval);
    };
  }, [typingCount]);
  return (
    <S.MainPageContainer>
      {uploading ? (
        <>
          <S.MainPageCheckBoxSection>
            <CheckBox
              click={() => {
                setExpireTimeBoolean(!expireTimeBoolean);
              }}
              isCheck={expireTimeBoolean}
              label={'????????????'}
            />
            <CheckBox
              click={() => {
                setDownloadCountBoolean(!downloadCountBoolean);
                setDownloadCount(1);
              }}
              isCheck={downloadCountBoolean}
              label={'???????????? ??????'}
            />
            <CheckBox
              click={() => setPasswordBoolean(!passwordBoolean)}
              isCheck={passwordBoolean}
              label={'????????????'}
            />
          </S.MainPageCheckBoxSection>
          {expireTimeBoolean && (
            <ExpireTime
              expireTime={Number(expireTime)}
              setExpireTime={setExpireTime}
              expireTimePlusButton={['1???', '10???', '1??????', '1???']}
              time={getTime(Number(expireTime))}
            />
          )}
          {downloadCountBoolean && (
            <DownloadCountSlider
              downloadCount={downloadCount}
              setDownloadCount={setDownloadCount}
            />
          )}
          {passwordBoolean && (
            <PasswordInput
              type={passwordFilter ? 'password' : 'text'}
              isFillter={passwordFilter}
              setPassword={setPassword}
              setPasswordFilter={setPasswordFilter}
              placeholder="??????????????? ??????????????????."
            />
          )}
          <FileFind handleChangeFile={handleChangeFile} fileProps={fileProps} />
          <UpLoadButton type={'button'} value={'?????????'} onClick={UpLoad} />
        </>
      ) : (
        <Progress
          value={progressValue}
          fileName={fileProps.filename}
          typing={typingText[typingCount]}
          stateText={progressStateText}
        />
      )}
    </S.MainPageContainer>
  );
};
