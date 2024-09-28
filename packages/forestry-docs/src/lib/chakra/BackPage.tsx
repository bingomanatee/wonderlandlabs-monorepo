import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigator } from '../navigation';
import { Portal, Box } from '@chakra-ui/react';

export const BackPage = () => {
  const navigate = useNavigate();
  const back = useCallback(() => navigator.backPage(navigate), [navigate]);
  return (
    <Portal>
      <Box layerStyle="prevButton">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 40 200"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          xmlSpace="preserve"
          style={{
            fillRule: 'evenodd',
            clipRule: 'evenodd',
            strokeLinejoin: 'round',
            strokeMiterlimit: 2,
          }}
          onClick={back}
        >
          <g id="back-page" transform="matrix(0.5,0,0,0.487805,-125,168.883)">
            <rect
              x={250}
              y={-346.211}
              width={80}
              height={410}
              style={{
                fill: 'none',
              }}
            />
            <clipPath id="_clip1">
              <rect x={250} y={-346.211} width={80} height={410} />
            </clipPath>
            <g clipPath="url(#_clip1)">
              <g transform="matrix(-1,0,0,1,580,0.789484)">
                <path
                  d="M250,7.197L308,-142L250,-290.053L250,-346.211L330,-142L250,63.789L250,7.197Z"
                  className="navButton"
                />
              </g>
            </g>
          </g>
        </svg>
      </Box>
    </Portal>
  );
};
