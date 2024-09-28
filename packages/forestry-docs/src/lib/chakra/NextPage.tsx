import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigator } from '../navigation';
import { Portal, Box } from '@chakra-ui/react';

export const NextPage = () => {
  const navigate = useNavigate();
  const next = useCallback(() => navigator.nextPage(navigate), [navigate]);
  return (
    <Portal>
      <Box layerStyle="nextButton">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 41 200"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          xmlSpace="preserve"
          style={{
            fillRule: 'evenodd',
            clipRule: 'evenodd',
            strokeLinejoin: 'round',
            strokeMiterlimit: 2,
          }}
          onClick={next}
        >
          <g transform="matrix(1,0,0,1,-55,0)">
            <g id="next-page" transform="matrix(0.5,0,0,0.487805,-69.3344,168.883)">
              <clipPath id="next-button-clip">
                <rect x={250} y={-346.211} width={80} height={410} />
              </clipPath>
              <g clipPath="url(#next-button-clip)">
                <g transform="matrix(1,0,0,1,2.84217e-14,0.789484)">
                  <path
                    d="M250,7.197L308,-142L250,-290.053L250,-346.211L330,-142L250,63.789L250,7.197Z"
                    className="navButton"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </Box>
    </Portal>
  );
};
