import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setPassengerInfo,
  removeDepartureSeat,
  addDepartureSeat,
} from "../../../store/order/orderSlice";
import "./PassengersForm.css";

const BIRTH_CERTIFICATE_REGEX = /^[IVXLCDM]+-[А-ЯЁ]{2}-\d{6}$/;
const BIRTHDAY_REGEX = /^\d{2}\.\d{2}\.\d{4}$/;

const formatBirthday = (value) => {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.length === 0) return "";
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);
  const parts = [d, m, y].filter(Boolean);
  return parts.join(".");
};

const formatPassportSeries = (value) => {
  return (value || "").replace(/\D/g, "").slice(0, 4);
};

const formatPassportNumber = (value) => {
  return (value || "").replace(/\D/g, "").slice(0, 6);
};

const formatBirthCertificate = (value) => {
  const raw = (value || "")
    .replace(/[\s-]/g, "")
    .toUpperCase();
  let roman = "";
  let letters = "";
  let digits = "";
  const romanChars = "IVXLCDM";
  const cyrillic = /[А-ЯЁ]/;
  const digitChars = /\d/;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (
      romanChars.includes(c) &&
      letters === "" &&
      digits === "" &&
      roman.length < 4
    ) {
      roman += c;
    } else if (cyrillic.test(c) && digits === "" && letters.length < 2) {
      letters += c;
    } else if (digitChars.test(c) && digits.length < 6) {
      digits += c;
    } else break;
  }
  if (roman && letters && digits) {
    return `${roman}-${letters}-${digits}`;
  }
  if (roman && letters) return `${roman}-${letters}`;
  if (roman) return roman;
  return letters + digits;
};

const PassengersForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector((state) => state.order);
  const { data } = order;
  const { departure } = data;
  const passengers = departure.seats;
  const [expandedPassenger, setExpandedPassenger] = useState(0);
  const [certificateErrors, setCertificateErrors] = useState({});
  const [dismissedCertificateWarnings, setDismissedCertificateWarnings] =
    useState({});
  const [openSelectDropdown, setOpenSelectDropdown] = useState(null);

  useEffect(() => {
    if (!openSelectDropdown) return;
    const handleClickOutside = (e) => {
      const wrap = document.querySelector(
        `[data-dropdown-id="${openSelectDropdown}"]`,
      );
      if (wrap && !wrap.contains(e.target)) setOpenSelectDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openSelectDropdown]);

  const handlePassengerChange = (seatIndex, field, value) => {
    const personInfo = { ...passengers[seatIndex].person_info };
    if (
      field === "gender" ||
      field === "is_adult" ||
      field === "is_child" ||
      field === "include_children_seat" ||
      field === "limited_mobility"
    ) {
      personInfo[field] = value === "true" || value === true;
    } else {
      personInfo[field] = value;
    }
    dispatch(setPassengerInfo({ seatIndex, personInfo }));
  };

  const setPassengerType = (seatIndex, isAdult) => {
    const personInfo = {
      ...passengers[seatIndex].person_info,
      is_adult: isAdult,
    };
    dispatch(setPassengerInfo({ seatIndex, personInfo }));
  };

  const handleIncludeChildrenSeat = (seatIndex, checked) => {
    dispatch(
      setPassengerInfo({
        seatIndex,
        personInfo: passengers[seatIndex].person_info,
        include_children_seat: checked,
      }),
    );
  };

  const isPassengersValid = passengers.every((passenger) => {
    const info = passenger.person_info;
    const firstName = (info.first_name || "").trim();
    const lastName = (info.last_name || "").trim();
    const birthdayValue = (info.birthday || "").trim();
    if (
      !firstName ||
      !lastName ||
      !birthdayValue ||
      !BIRTHDAY_REGEX.test(birthdayValue) ||
      (info.gender !== true && info.gender !== false) ||
      !info.document_type
    ) {
      return false;
    }

    if (info.document_type === "свидетельство") {
      const num = (info.document_data || "").trim();
      return num.length > 0 && BIRTH_CERTIFICATE_REGEX.test(num);
    }

    const seriesDigits = (info.document_series || "").replace(/\D/g, "");
    const numberDigits = (info.document_data || "").replace(/\D/g, "");
    return seriesDigits.length === 4 && numberDigits.length === 6;
  });

  const handleNextStep = () => {
    if (isPassengersValid) navigate("/payment");
  };

  const toggleExpanded = (index) => {
    setExpandedPassenger((prev) => (prev === index ? -1 : index));
  };

  const handleRemovePassenger = (e, seatIndex) => {
    e.stopPropagation();
    if (passengers.length <= 1) return;
    dispatch(removeDepartureSeat(seatIndex));
    setCertificateErrors((prev) => {
      const next = { ...prev };
      delete next[seatIndex];
      Object.keys(next).forEach((k) => {
        const i = parseInt(k, 10);
        if (i > seatIndex) {
          next[i - 1] = next[i];
          delete next[i];
        }
      });
      return next;
    });
    setExpandedPassenger((prev) => {
      if (prev === seatIndex) return 0;
      if (prev > seatIndex) return prev - 1;
      return prev;
    });
  };

  const CERT_MIN_LENGTH = 11;

  const handleCertificateNumberChange = (seatIndex, value) => {
    const formatted = formatBirthCertificate(value);
    handlePassengerChange(seatIndex, "document_data", formatted);
    const trimmed = (formatted || "").trim();
    setDismissedCertificateWarnings((prev) => {
      const next = { ...prev };
      delete next[seatIndex];
      return next;
    });
    setCertificateErrors((prev) => {
      if (!trimmed) {
        const next = { ...prev };
        delete next[seatIndex];
        return next;
      }
      const next = { ...prev };
      if (
        trimmed.length >= CERT_MIN_LENGTH &&
        !BIRTH_CERTIFICATE_REGEX.test(trimmed)
      ) {
        next[seatIndex] = true;
      } else {
        delete next[seatIndex];
      }
      return next;
    });
  };

  const handleDismissCertificateWarning = (seatIndex) => {
    setDismissedCertificateWarnings((prev) => ({ ...prev, [seatIndex]: true }));
  };

  const handleBirthdayChange = (seatIndex, value) => {
    handlePassengerChange(seatIndex, "birthday", formatBirthday(value));
  };

  const handlePassportSeriesChange = (seatIndex, value) => {
    handlePassengerChange(
      seatIndex,
      "document_series",
      formatPassportSeries(value),
    );
  };

  const handlePassportNumberChange = (seatIndex, value) => {
    handlePassengerChange(
      seatIndex,
      "document_data",
      formatPassportNumber(value),
    );
  };

  return (
    <div className="passengers-form">
      <div className="passengers-section">
        {passengers.map((passenger, seatIndex) => {
          const isExpanded =
            expandedPassenger === seatIndex || passengers.length === 1;
          const isAdult =
            passenger.person_info?.is_adult !== false && !passenger.is_child;
          const info = passenger.person_info || {};
          const birthdayValue = (info.birthday || "").trim();
          const birthdayInvalid =
            birthdayValue.length > 0 && !BIRTHDAY_REGEX.test(birthdayValue);
          const isCert = info.document_type === "свидетельство";
          const passportSeriesDigits = (info.document_series || "").replace(
            /\D/g,
            "",
          );
          const passportNumberDigits = (info.document_data || "").replace(
            /\D/g,
            "",
          );
          const passportSeriesInvalid =
            !isCert &&
            passportSeriesDigits.length > 0 &&
            passportSeriesDigits.length !== 4;
          const passportNumberInvalid =
            !isCert &&
            passportNumberDigits.length > 0 &&
            passportNumberDigits.length !== 6;

          return (
            <div key={seatIndex} className="passenger-card">
              <div
                className="passenger-card-header"
                onClick={() => toggleExpanded(seatIndex)}
                onKeyDown={(e) =>
                  e.key === "Enter" && toggleExpanded(seatIndex)
                }
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
              >
                <span className="passenger-card-header-icon" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 7L10 13L16 7"
                      stroke="#928F94"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3 className="passenger-card-title">
                  Пассажир {seatIndex + 1}
                </h3>
                <button
                  type="button"
                  className="passenger-card-delete"
                  onClick={(e) => handleRemovePassenger(e, seatIndex)}
                  disabled={passengers.length <= 1}
                  aria-label="Удалить пассажира"
                  title="Удалить пассажира"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M1 1L11 11M11 1L1 11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {isExpanded && (
                <div className="passenger-card-body">
                  <div className="passenger-type-row">
                    <label
                      className="passenger-type-label"
                      htmlFor={`passenger-type-${seatIndex}`}
                    >
                      Тип пассажира
                    </label>
                    <div
                      className="passenger-select-wrap"
                      data-dropdown-id={`${seatIndex}-passengerType`}
                    >
                      <button
                        type="button"
                        id={`passenger-type-${seatIndex}`}
                        className="passenger-type-select passenger-select-btn"
                        onClick={() =>
                          setOpenSelectDropdown((prev) =>
                            prev === `${seatIndex}-passengerType`
                              ? null
                              : `${seatIndex}-passengerType`,
                          )
                        }
                        aria-expanded={
                          openSelectDropdown === `${seatIndex}-passengerType`
                        }
                        aria-haspopup="listbox"
                      >
                        {isAdult ? "Взрослый" : "Детский"}
                      </button>
                      {openSelectDropdown === `${seatIndex}-passengerType` && (
                        <div
                          className="passenger-select-dropdown"
                          role="listbox"
                        >
                          <button
                            type="button"
                            role="option"
                            aria-selected={isAdult}
                            className={`passenger-select-dropdown-item ${isAdult ? "active" : ""}`}
                            onClick={() => {
                              setPassengerType(seatIndex, true);
                              setOpenSelectDropdown(null);
                            }}
                          >
                            Взрослый
                          </button>
                          <button
                            type="button"
                            role="option"
                            aria-selected={!isAdult}
                            className={`passenger-select-dropdown-item ${!isAdult ? "active" : ""}`}
                            onClick={() => {
                              setPassengerType(seatIndex, false);
                              setOpenSelectDropdown(null);
                            }}
                          >
                            Детский
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="passenger-fields">
                    <div className="passenger-field-row passenger-field-row-triple">
                      <div className="passenger-field">
                        <label>Фамилия</label>
                        <input
                          type="text"
                          value={passenger.person_info.last_name || ""}
                          onChange={(e) =>
                            handlePassengerChange(
                              seatIndex,
                              "last_name",
                              e.target.value,
                            )
                          }
                          placeholder="Иванов"
                        />
                      </div>
                      <div className="passenger-field">
                        <label>Имя</label>
                        <input
                          type="text"
                          value={passenger.person_info.first_name || ""}
                          onChange={(e) =>
                            handlePassengerChange(
                              seatIndex,
                              "first_name",
                              e.target.value,
                            )
                          }
                          placeholder="Иван"
                        />
                      </div>
                      <div className="passenger-field">
                        <label>Отчество</label>
                        <input
                          type="text"
                          value={passenger.person_info.patronymic || ""}
                          onChange={(e) =>
                            handlePassengerChange(
                              seatIndex,
                              "patronymic",
                              e.target.value,
                            )
                          }
                          placeholder="Иванович"
                        />
                      </div>
                    </div>

                    <div className="passenger-field-row passenger-field-row-gender-date">
                      <div className="passenger-field">
                        <label>Пол</label>
                        <div className="passenger-gender-toggle">
                          <button
                            type="button"
                            className={`passenger-gender-btn ${passenger.person_info.gender === true ? "active" : ""}`}
                            onClick={() =>
                              handlePassengerChange(seatIndex, "gender", true)
                            }
                          >
                            М
                          </button>
                          <button
                            type="button"
                            className={`passenger-gender-btn ${passenger.person_info.gender === false ? "active" : ""}`}
                            onClick={() =>
                              handlePassengerChange(seatIndex, "gender", false)
                            }
                          >
                            Ж
                          </button>
                        </div>
                      </div>
                      <div className="passenger-field passenger-field-date">
                        <label>Дата рождения</label>
                        <input
                          type="text"
                          value={passenger.person_info.birthday || ""}
                          onChange={(e) =>
                            handleBirthdayChange(seatIndex, e.target.value)
                          }
                          placeholder="ДД.ММ.ГГГГ"
                          maxLength={10}
                          className={
                            birthdayInvalid ? "passenger-input-error" : undefined
                          }
                          aria-invalid={birthdayInvalid}
                        />
                        {birthdayInvalid && (
                          <p className="passenger-error-text">
                            Введите дату рождения в формате ДД.ММ.ГГГГ
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="passenger-field passenger-mobility">
                      <label className="passenger-checkbox-label">
                        <input
                          type="checkbox"
                          checked={!!passenger.person_info.limited_mobility}
                          onChange={(e) =>
                            handlePassengerChange(
                              seatIndex,
                              "limited_mobility",
                              e.target.checked,
                            )
                          }
                        />
                        <span>ограниченная подвижность</span>
                      </label>
                    </div>

                    <div className="passenger-field-row passenger-field-row-doc">
                      <div className="passenger-field passenger-field-doc-type">
                        <label>Тип документа</label>
                        <div
                          className="passenger-select-wrap"
                          data-dropdown-id={`${seatIndex}-documentType`}
                        >
                          <button
                            type="button"
                            className="passenger-field-select-btn passenger-select-btn"
                            onClick={() =>
                              setOpenSelectDropdown((prev) =>
                                prev === `${seatIndex}-documentType`
                                  ? null
                                  : `${seatIndex}-documentType`,
                              )
                            }
                            aria-expanded={
                              openSelectDropdown === `${seatIndex}-documentType`
                            }
                            aria-haspopup="listbox"
                          >
                            {passenger.person_info.document_type ===
                            "свидетельство"
                              ? "Свидетельство о рождении"
                              : "Паспорт РФ"}
                          </button>
                          {openSelectDropdown ===
                            `${seatIndex}-documentType` && (
                            <div
                              className="passenger-select-dropdown"
                              role="listbox"
                            >
                              <button
                                type="button"
                                role="option"
                                aria-selected={
                                  passenger.person_info.document_type !==
                                  "свидетельство"
                                }
                                className={`passenger-select-dropdown-item ${
                                  passenger.person_info.document_type !==
                                  "свидетельство"
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() => {
                                  handlePassengerChange(
                                    seatIndex,
                                    "document_type",
                                    "паспорт",
                                  );
                                  setCertificateErrors((prev) => {
                                    const next = { ...prev };
                                    delete next[seatIndex];
                                    return next;
                                  });
                                  setDismissedCertificateWarnings((prev) => {
                                    const next = { ...prev };
                                    delete next[seatIndex];
                                    return next;
                                  });
                                  setOpenSelectDropdown(null);
                                }}
                              >
                                Паспорт РФ
                              </button>
                              <button
                                type="button"
                                role="option"
                                aria-selected={
                                  passenger.person_info.document_type ===
                                  "свидетельство"
                                }
                                className={`passenger-select-dropdown-item ${
                                  passenger.person_info.document_type ===
                                  "свидетельство"
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() => {
                                  handlePassengerChange(
                                    seatIndex,
                                    "document_type",
                                    "свидетельство",
                                  );
                                  const num = (
                                    passengers[seatIndex].person_info
                                      ?.document_data || ""
                                  ).trim();
                                  setCertificateErrors((prev) => {
                                    const next = { ...prev };
                                    if (
                                      num.length >= CERT_MIN_LENGTH &&
                                      !BIRTH_CERTIFICATE_REGEX.test(num)
                                    ) {
                                      next[seatIndex] = true;
                                    } else {
                                      delete next[seatIndex];
                                    }
                                    return next;
                                  });
                                  setDismissedCertificateWarnings((prev) => {
                                    const next = { ...prev };
                                    delete next[seatIndex];
                                    return next;
                                  });
                                  setOpenSelectDropdown(null);
                                }}
                              >
                                Свидетельство о рождении
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {passenger.person_info.document_type ===
                      "свидетельство" ? (
                        <div className="passenger-field passenger-field-cert-number">
                          <label>Номер</label>
                          <input
                            type="text"
                            className={
                              certificateErrors[seatIndex]
                                ? "passenger-cert-input passenger-cert-input-error"
                                : "passenger-cert-input"
                            }
                            value={passenger.person_info.document_data || ""}
                            onChange={(e) =>
                              handleCertificateNumberChange(
                                seatIndex,
                                e.target.value,
                              )
                            }
                            placeholder="VIII-ЫП-123456"
                            maxLength={14}
                            aria-invalid={!!certificateErrors[seatIndex]}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="passenger-field">
                            <label>Серия</label>
                            <input
                              type="text"
                              value={
                                passenger.person_info.document_series || ""
                              }
                              onChange={(e) =>
                                handlePassportSeriesChange(
                                  seatIndex,
                                  e.target.value,
                                )
                              }
                              placeholder="_ _ _ _"
                              maxLength={4}
                              inputMode="numeric"
                              className={
                                passportSeriesInvalid
                                  ? "passenger-input-error"
                                  : undefined
                              }
                              aria-invalid={passportSeriesInvalid}
                            />
                            {passportSeriesInvalid && (
                              <p className="passenger-error-text">
                                Серия паспорта должна содержать 4 цифры
                              </p>
                            )}
                          </div>
                          <div className="passenger-field">
                            <label>Номер</label>
                            <input
                              type="text"
                              value={passenger.person_info.document_data || ""}
                              onChange={(e) =>
                                handlePassportNumberChange(
                                  seatIndex,
                                  e.target.value,
                                )
                              }
                              placeholder="_ _ _ _ _ _"
                              maxLength={6}
                              inputMode="numeric"
                              className={
                                passportNumberInvalid
                                  ? "passenger-input-error"
                                  : undefined
                              }
                              aria-invalid={passportNumberInvalid}
                            />
                            {passportNumberInvalid && (
                              <p className="passenger-error-text">
                                Номер паспорта должен содержать 6 цифр
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {!isAdult && (
                      <div className="passenger-field passenger-mobility">
                        <label className="passenger-checkbox-label">
                          <input
                            type="checkbox"
                            checked={!!passenger.include_children_seat}
                            onChange={(e) =>
                              handleIncludeChildrenSeat(
                                seatIndex,
                                e.target.checked,
                              )
                            }
                          />
                          <span>Доп. место для ребенка</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isExpanded &&
                passenger.person_info.document_type === "свидетельство" &&
                certificateErrors[seatIndex] &&
                !dismissedCertificateWarnings[seatIndex] && (
                  <div className="passenger-certificate-warning" role="alert">
                    <p className="passenger-certificate-warning-text">
                      Номер свидетельства о рождении указан некорректно. Пример:
                      VIII-ЫП-123456
                    </p>
                    <button
                      type="button"
                      className="passenger-certificate-warning-close"
                      onClick={() => handleDismissCertificateWarning(seatIndex)}
                      aria-label="Закрыть"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M1 1L11 11M11 1L1 11"
                          stroke="rgba(255, 61, 0, 0.38)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                )}

              {(() => {
                const isCert =
                  passenger.person_info.document_type === "свидетельство";
                const certValue = (
                  passenger.person_info.document_data || ""
                ).trim();
                const certValidComplete =
                  certValue.length > 0 &&
                  BIRTH_CERTIFICATE_REGEX.test(certValue);
                const certHasError = !!certificateErrors[seatIndex];
                const notLast = seatIndex < passengers.length - 1;

                const showDefaultBlock =
                  notLast && (!isCert || (!certValidComplete && !certHasError));

                const showDoneBlock = isCert && certValidComplete;

                return (
                  <>
                    {isExpanded && notLast && showDefaultBlock && (
                      <>
                        <div className="passenger-divider-dashed" aria-hidden />
                        <button
                          type="button"
                          className="passenger-next-btn"
                          onClick={() => setExpandedPassenger(seatIndex + 1)}
                        >
                          Следующий пассажир
                        </button>
                      </>
                    )}

                    {isExpanded && showDoneBlock && (
                      <div className="passenger-certificate-done">
                        <span
                          className="passenger-certificate-done-icon"
                          aria-hidden
                        >
                          <svg
                            className="passenger-certificate-done-icon-img"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 10L8 15L17 5"
                              stroke="#b2f6a1"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="passenger-certificate-done-text">
                          Готово
                        </span>
                        {notLast && (
                          <button
                            type="button"
                            className="passenger-next-btn passenger-next-btn-in-done"
                            onClick={() => setExpandedPassenger(seatIndex + 1)}
                          >
                            Следующий пассажир
                          </button>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          );
        })}

        <button
          type="button"
          className="btn-add-passenger"
          onClick={() => {
            dispatch(addDepartureSeat());
            setExpandedPassenger(passengers.length);
          }}
        >
          <span className="btn-add-passenger-text">Добавить пассажира</span>
          <span className="btn-add-passenger-icon" aria-hidden>
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 1V12M1 6.5H12"
                stroke="#FFA800"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>

        <div className="form-actions form-actions-main">
          <button
            type="button"
            className="passengers-btn-next"
            onClick={handleNextStep}
            disabled={!isPassengersValid}
          >
            ДАЛЕЕ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengersForm;
