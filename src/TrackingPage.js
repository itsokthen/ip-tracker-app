import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import icon from "./icon";
import { transformation } from "leaflet";
import MarkerPosition from "./MarkerPosition";

const TrackingPage = () => {
  const [address, setAddress] = useState(null);
  const [ipAddress, setIpAddress] = useState("");

  const checkIpAddress =
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;
  const checkDomain =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/;

  useEffect(() => {
    try {
      const getInitialData = async () => {
        const res = await fetch(
          `https://geo.ipify.org/api/v2/country,city?apiKey=${process.env.REACT_APP_API_KEY}&ipAddress=8.8.8.8`
        );
        const data = await res.json();
        setAddress(data);
      };

      getInitialData();
    } catch (error) {
      console.trace(error);
    }
  }, []);

  const getEnteredData = async () => {
    const res = await fetch(
      `https://geo.ipify.org/api/v2/country,city?apiKey=${
        process.env.REACT_APP_API_KEY
      }&${
        checkIpAddress.test(ipAddress)
          ? `ipAddress=${ipAddress}`
          : checkDomain.test(ipAddress)
          ? `domain=${ipAddress}`
          : ""
      }`
      // https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}&ipAddress=8.8.8.8&domain=google.com
    );
    const data = await res.json();
    if (data.code === 400) return;

    setAddress(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getEnteredData();
    setIpAddress("");
  };

  return (
    <>
      <Header>
        <h2>IP Address Tracker</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search for any IP address or domain"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
          />
          <button type="submit">
            <img src="./images/icon-arrow.svg" alt=">" />
          </button>
        </form>
        <Wrapper>
          {address && (
            <>
              <IPInfo>
                <div>
                  <h6>IP ADDRESS</h6>
                  <h3>{address.ip}</h3>
                </div>
                <div>
                  <h6>LOCATION</h6>
                  <h3>
                    {address.location.city}, {address.location.region}
                  </h3>
                </div>
                <div>
                  <h6>TIMEZONE</h6>
                  <h3>UTC {address.location.timezone}</h3>
                </div>
                <div>
                  <h6>ISP</h6>
                  <h3>{address.isp}</h3>
                </div>
              </IPInfo>
            </>
          )}
          {!address && (
            <IPInfo
              style={{
                transform: "translateY(-160px)",
                paddingBottom: "15px",
                color: "red",
              }}
            >
              Please Disable Adblocker
            </IPInfo>
          )}
        </Wrapper>
      </Header>
      {address && (
        <>
          <Map>
            <MapContainer
              center={[address.location.lat, address.location.lng]}
              zoom={13}
              scrollWheelZoom={true}
              zoomControl={false}
              style={{
                height: "500px",
                width: "100vw",
                position: "relative",
                zIndex: "0",
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MarkerPosition address={address} />
            </MapContainer>
          </Map>
        </>
      )}
    </>
  );
};

const Header = styled.div`
  position: relative;
  z-index: 100;
  height: auto;
  min-height: 350px;
  width: 100vw;
  display: flex;
  padding: 0 30px;
  flex-direction: column;
  align-items: center;
  background-image: url("images/pattern-bg.png");
  background-position: center;
  background-size: cover;
  h2 {
    margin-top: 30px;
    color: white;
    font-weight: 500;
  }
  form {
    margin-top: 30px;
    display: block;
    height: 60px;
    width: 100%;
    border-radius: 15px;
    background-color: white;
    border: none;
    position: relative;

    input {
      width: 80%;
      font-size: 14px;
      font-weight: 500;
      padding: 20px 15px;
      background: none;
      outline: none;
      border: none;
    }
    button {
      cursor: pointer;
      position: absolute;
      right: 0;
      width: 50px;
      height: 100%;
      background-color: black;
      border-radius: 0 15px 15px 0;
      border: none;
      margin-left: 90%;
    }
  }
`;

const Wrapper = styled.div`
  position: absolute;
  bottom: -110px;
  max-height: 300px;
  width: 100%;
`;
const IPInfo = styled.div`
  height: 100%;
  margin: 0 30px;
  background-color: white;
  display: flex;
  border-radius: 15px;
  flex-direction: column;
  align-items: center;
  padding-top: 15px;
  div {
    text-align: center;
    color: hsl(0, 0%, 17%);
    width: 100%;
    margin-bottom: 20px;
    h6 {
      margin-bottom: 6px;
      font-weight: 500;
      color: hsl(0, 0%, 59%);
    }
  }
`;

const Map = styled.div`
  height: 100vh;
`;

export default TrackingPage;
