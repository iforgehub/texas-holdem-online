import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container';
import Button from '../components/buttons/Button';
import gameContext from '../context/game/gameContext';
import socketContext from '../context/websocket/socketContext';
import globalContext from '../context/global/globalContext';
import PokerTable from '../components/game/PokerTable';
import { RotateDevicePrompt } from '../components/game/RotateDevicePrompt';
import { PositionedUISlot } from '../components/game/PositionedUISlot';
import { PokerTableWrapper } from '../components/game/PokerTableWrapper';
import { Seat } from '../components/game/Seat/Seat';
import { InfoPill } from '../components/game/InfoPill';
import { GameUI } from '../components/game/GameUI';
import { GameStateInfo } from '../components/game/GameStateInfo';
import BrandingImage from '../components/game/BrandingImage';
import PokerCard from '../components/game/PokerCard';
import background from '../assets/img/background.png';
import LoadingScreen from '../components/loading/LoadingScreen';
import { CS_FETCH_LOBBY_INFO } from '../core/actions';
import logger from '../utils/logger';
import './Play.scss';

/**
 * Play Page Component
 * Main game interface for playing Texas Hold'em poker
 */
const Play = () => {
  const navigate = useNavigate();
  const { socket } = useContext(socketContext);
  const { walletAddress, userName, id } = useContext(globalContext);
  const {
    messages,
    currentTable,
    seatId,
    joinTable,
    leaveTable,
    sitDown,
    standUp,
    fold,
    check,
    call,
    raise,
  } = useContext(gameContext);

  const [bet, setBet] = useState(0);
  const [minLoadTimeElapsed, setMinLoadTimeElapsed] = useState(false);
  const [playerRegistered, setPlayerRegistered] = useState(false);

  // Ensure minimum 5-second loading screen after login
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadTimeElapsed(true)
    }, 5000) // Minimum 5 seconds

    return () => clearTimeout(timer)
  }, [])

  // Register player and join table
  useEffect(() => {
    // Validate prerequisites
    if (!socket || !socket.connected) {
      navigate('/');
      return;
    }

    if (!walletAddress) {
      navigate('/');
      return;
    }

    // Register player first if not already registered
    if (!playerRegistered && socket.connected) {
      const username = userName || walletAddress || `Player_${id || 'Guest'}`;
      
      logger.info('Registering player:', { walletAddress, username });
      
      // Register player via CS_FETCH_LOBBY_INFO
      socket.emit(CS_FETCH_LOBBY_INFO, {
        walletAddress,
        socketId: socket.id,
        gameId: 'demo-game',
        username,
      });
      
      // Mark as registered and wait for server to process
      setPlayerRegistered(true);
      
      // Wait for player registration to complete, then join table
      // The SC_RECEIVE_LOBBY_INFO event confirms registration
      const joinTimer = setTimeout(() => {
        if (socket.connected) {
          joinTable(1);
        }
      }, 1000); // Give server time to register player
      
      return () => clearTimeout(joinTimer);
    } else if (playerRegistered) {
      // Player already registered, just join table
      joinTable(1);
    }

    // Cleanup on unmount
    return () => {
      if (socket && socket.connected) {
        leaveTable();
      }
    };
  }, [socket, walletAddress, userName, id, playerRegistered, navigate, joinTable, leaveTable]);

  // Update bet amount based on table state
  useEffect(() => {
    if (!currentTable) return;

    if (currentTable.callAmount > currentTable.minBet) {
      setBet(currentTable.callAmount);
    } else if (currentTable.pot > 0) {
      setBet(currentTable.minRaise);
    } else {
      setBet(currentTable.minBet);
    }
  }, [currentTable]);

  // Memoize container styles
  const containerStyles = useMemo(
    () => ({
      backgroundImage: `url(${background})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed',
      backgroundColor: 'black',
    }),
    []
  );

  const loadingContainerStyles = useMemo(
    () => ({
      ...containerStyles,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    }),
    [containerStyles]
  );

  // Show loading screen for minimum 5 seconds OR while waiting for table to join
  if (!minLoadTimeElapsed || !currentTable) {
    return (
      <Container
        fullHeight
        style={loadingContainerStyles}
        className="play-area"
      >
        <LoadingScreen />
      </Container>
    );
  }

  return (
    <>
      <RotateDevicePrompt />
      <Container
        fullHeight
        style={containerStyles}
        className="play-area"
      >
        {currentTable && (
          <>
            <PositionedUISlot
              top="2vh"
              left="1.5rem"
              scale="0.65"
              style={{ zIndex: '50' }}
            >
              <Button small secondary onClick={leaveTable}>
                Leave
              </Button>
            </PositionedUISlot>
          </>
        )}
        <PokerTableWrapper>
          <PokerTable />
          {currentTable && (
            <>
              <PositionedUISlot
                top="-5%"
                left="0"
                scale="0.55"
                origin="top left"
              >
                <Seat
                  seatNumber={1}
                  currentTable={currentTable}
                  sitDown={sitDown}
                />
              </PositionedUISlot>
              <PositionedUISlot
                top="-5%"
                right="2%"
                scale="0.55"
                origin="top right"
              >
                <Seat
                  seatNumber={2}
                  currentTable={currentTable}
                  sitDown={sitDown}
                />
              </PositionedUISlot>
              <PositionedUISlot
                bottom="15%"
                right="2%"
                scale="0.55"
                origin="bottom right"
              >
                <Seat
                  seatNumber={3}
                  currentTable={currentTable}
                  sitDown={sitDown}
                />
              </PositionedUISlot>
              <PositionedUISlot bottom="8%" scale="0.55" origin="bottom center">
                <Seat
                  seatNumber={4}
                  currentTable={currentTable}
                  sitDown={sitDown}
                />
              </PositionedUISlot>
              <PositionedUISlot
                bottom="15%"
                left="0"
                scale="0.55"
                origin="bottom left"
              >
                <Seat
                  seatNumber={5}
                  currentTable={currentTable}
                  sitDown={sitDown}
                />
              </PositionedUISlot>
              <PositionedUISlot
                top="-25%"
                scale="0.55"
                origin="top center"
                style={{ zIndex: '1' }}
              >
                <BrandingImage></BrandingImage>
              </PositionedUISlot>
              <PositionedUISlot
                width="100%"
                origin="center center"
                scale="0.60"
                style={{
                  display: 'flex',
                  textAlign: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {currentTable.board && currentTable.board.length > 0 && (
                  <>
                    {currentTable.board.map((card, index) => (
                      <PokerCard key={index} card={card} />
                    ))}
                  </>
                )}
              </PositionedUISlot>
              <PositionedUISlot top="-5%" scale="0.60" origin="bottom center">
                {messages && messages.length > 0 && (
                  <>
                    <InfoPill>{messages[messages.length - 1]}</InfoPill>
                    {currentTable.winMessages.length > 0 && (
                      <InfoPill>
                        {
                          currentTable.winMessages[
                            currentTable.winMessages.length - 1
                          ]
                        }
                      </InfoPill>
                    )}
                  </>
                )}
              </PositionedUISlot>
              <PositionedUISlot top="12%" scale="0.60" origin="center center">
                {currentTable.winMessages.length === 0 && (
                  <GameStateInfo currentTable={currentTable} />
                )}
              </PositionedUISlot>
            </>
          )}
        </PokerTableWrapper>

        {currentTable &&
          currentTable.seats[seatId] &&
          currentTable.seats[seatId].turn && (
            <GameUI
              currentTable={currentTable}
              seatId={seatId}
              bet={bet}
              setBet={setBet}
              raise={raise}
              standUp={standUp}
              fold={fold}
              check={check}
              call={call}
            />
          )}
      </Container>
    </>
  )
}

export default Play
